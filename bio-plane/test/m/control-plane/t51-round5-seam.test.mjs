/* control-plane R123, R125 (fix round 5, E1, E3, E5, E6, E2; K4530; R-SEAM, R-STOP): THE WALKERS' CASES THROUGH THE REAL PLANE. The Worker the product deploys, its
   object, its alarm and R2 under Miniflare; the network and the OCR member scripted; each case is a member's own act, the way the screens press it, and ends at
   `op=reading` with no further press. R-STOP: every "reading follows" case asserts the words are in `text_units`, never only that a reading exists. The files
   are made here (text-layer PDFs, a scan, text), never taken from a jurisdiction.
     E1  a 10 MB and a 22 MiB PDF and a 12 MB text file uploaded and promoted are read with their words; a 3 MB PDF is as before; a 30 MB PDF states the ceiling;
     E3  a 41.5 MB five-part capture and a 52 MB (over the 50 MiB whole-read ceiling of text, R132; a 40 MB text is deferred, not stated) five-part upload state their size at once (before any keep has run), and "Read it" answers `read: true`;
     E5  a 273-byte text knock is pulled and read; a NUL in a declared text type is not read as text; a `.txt` name with no type is;
     E6  a 60-page scan, uploaded and promoted, has all 60 pages' text with no press (the OCR member answers 24 pages a call); the press answers at once.
   Red by name until the providers have merged: E1 (acquisition R-profile, reading-pipeline, extraction), E3 (extraction `readHeld` of a multipart home over the
   ceiling), E5 (acquisition's `textTypeOf`, doorbell), E6 and E2 (plane R77's accounting). */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const MB = 1024 * 1024;
const ADM = "adm-r5seam-0123456789abcdef", PASSWORD = "the founder's long password, round five", ORIGIN = "https://group.example";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const te = (t) => new TextEncoder().encode(t);

/* a PDF of `megabytes` MB whose one page of text says `words`, filled out by a stream no page names (the reader is xref-free) */
function pdfOf(words, megabytes) {
  const pad = new Uint8Array(Math.floor(megabytes * MB));
  let x = 0x9e3779b9;
  for (let i = 0; i < pad.length; i++) { x = (x * 1664525 + 1013904223) >>> 0; pad[i] = 0x41 + ((x >>> 24) % 26); }
  const stream = (n, dict, data) => [te(`${n} 0 obj\n<< ${dict} /Length ${data.length} >>\nstream\n`), data, te("\nendstream\nendobj\n")];
  const plain = (n, body) => [te(`${n} 0 obj\n${body}\nendobj\n`)];
  const toUni = "/CIDInit /ProcSet findresource begin 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <20> <7E> <0020> endbfrange end";
  const parts = [te("%PDF-1.7\n"), ...plain(1, "<< /Type /Catalog /Pages 2 0 R >>"), ...plain(2, "<< /Type /Pages /Kids [100 0 R] /Count 1 >>"),
    ...plain(10, `<< /Type /Font /Subtype /TrueType /BaseFont /Plain /FirstChar 32 /Widths [${Array(95).fill(500).join(" ")}] /ToUnicode 11 0 R >>`), ...stream(11, "", te(toUni)),
    ...plain(100, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 10 0 R >> >> /Contents 101 0 R >>"),
    ...stream(101, "", te(`BT /F1 12 Tf 72 700 Td (${words}) Tj ET`)), ...stream(500, "", pad), te("trailer\n<< /Root 1 0 R >>\n%%EOF\n")];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
/* a scan of `pages` pages, each one image and no text */
function scanOf(pages) {
  const parts = [te("%PDF-1.4\n"), te("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"),
    te(`2 0 obj\n<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${10 + i} 0 R`).join(" ")}] /Count ${pages} >>\nendobj\n`)];
  const img = new Uint8Array(2000).fill(200);
  parts.push(te(`3 0 obj\n<< /Type /XObject /Subtype /Image /Width 40 /Height 50 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${img.length} >>\nstream\n`), img, te("\nendstream\nendobj\n"));
  for (let i = 0; i < pages; i++) {
    const c = "q 500 0 0 700 50 50 cm /Im0 Do Q";
    parts.push(te(`${10 + i} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /XObject << /Im0 3 0 R >> >> /Contents ${500 + i} 0 R >>\nendobj\n`),
               te(`${500 + i} 0 obj\n<< /Length ${c.length} >>\nstream\n${c}\nendstream\nendobj\n`));
  }
  parts.push(te("trailer\n<< /Root 1 0 R >>\n%%EOF\n"));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
const textOf = (line, megabytes) => {
  const l = te(line + "\n"), out = new Uint8Array(Math.floor(megabytes * MB));
  for (let at = 0; at < out.length; at += l.length) out.set(l.subarray(0, Math.min(l.length, out.length - at)), at);
  return out;
};

let served = {};
const ocrCalls = [];
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  serviceBindings: { OCR_WORKER: async (req) => {
    const b = await req.json();
    const pages = (b.pages || []).slice(0, 24);   /* its real call: 24 pages */
    ocrCalls.push(pages.length);
    return new Response(JSON.stringify({ ok: true, engine: "tess", version: "5.3", cap: "C", measured_by: "M-1", confidence_floor: null,
      pages: pages.map((p) => ({ page: p, regions: [{ text: `ocr scan page ${p} words`, source: { kind: "pdf-page", ref: `p${p}`, page: p, rect: [0, 0, 10, 10] }, confidence: "none" }] })) }),
      { headers: { "content-type": "application/json" } });
  } },
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r5seam-0123456789abcdef", PROBE_TOKEN: "prb-r5seam-0123456789abcdef", VERSION: "4.7.5",
              INSTANCE_NAME: "r5seam-town", KNOCK_FINGERPRINT_KEY: "r5seam-fingerprint-key", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: (req) => {
    const b = served[new URL(req.url).pathname.split("/").pop()];
    return b ? new Response(b, { headers: { "content-type": "application/pdf", "content-length": String(b.length) } }) : new Response("not scripted", { status: 404 });
  },
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

let authOnce = null;
async function founder() {
  if (authOnce) return authOnce;
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return (authOnce = { authorization: `Bearer ${signed.result.token}` });
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => (await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() });
const readingOf = async (auth, digest) => (await (await plane(`/api/?op=reading&sha256=${digest}`, { headers: auth })).json()).result;
const unitsText = (r) => JSON.stringify(r && r.text_units ? r.text_units : []);
async function readingWith(auth, digest, words, ms) {
  const end = Date.now() + ms;
  let r = await readingOf(auth, digest);
  while (Date.now() < end && !(r && r.found && unitsText(r).includes(words))) { await later(3000); r = await readingOf(auth, digest); }
  return r;
}
/* the member's act as the capture screen presses it: upload the file, then file the document the upload answered */
async function uploadAndFile(auth, bytes, name, type) {
  const up = await (await plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: bytes })).json();
  const a = up.result;
  assert.equal(a.ok, true, JSON.stringify(up).slice(0, 400));
  assert.equal(a.document.capture.sha256, sha(bytes));
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screenCall(auth), { doc: a.document, title: name, locator: a.document.locator, project: "" });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
  return a;
}

/* ---- E1 ---- */

for (const [label, mb, type, file] of [["a 10 MB PDF", 10, "application/pdf", "pdf"], ["a 22 MiB PDF", 22, "application/pdf", "pdf"], ["a 12 MB text file", 12, "text/plain", "txt"]]) {
  test(`E1 (${label}): uploaded and promoted, read within an alarm with its words in the text units, no press`, { timeout: 600000 }, async () => {
    const auth = await founder();
    const words = `E1 ${label.replace(/\W+/g, "")} the board approved the minutes ${Date.now()}`;
    const bytes = file === "pdf" ? pdfOf(words, mb) : textOf(words, mb);
    await uploadAndFile(auth, bytes, `e1.${file}`, type);
    const r = await readingWith(auth, sha(bytes), "the board approved the minutes", 240000);
    assert.equal(r.found, true, JSON.stringify(r).slice(0, 400));
    assert.ok(unitsText(r).includes("the board approved the minutes"), `its words are in the text units: ${JSON.stringify(r.reading).slice(0, 300)}`);
    assert.notEqual(r.reading && r.reading.failure, "final");
  });
}
test("E1 (controls): a 3 MB PDF is read as before; a 30 MB PDF states the ceiling with its size", { timeout: 600000 }, async () => {
  const auth = await founder();
  const small = pdfOf(`E1 control three megabytes the clerk read the notice ${Date.now()}`, 3);
  await uploadAndFile(auth, small, "e1-small.pdf", "application/pdf");
  assert.ok(unitsText(await readingWith(auth, sha(small), "the clerk read the notice", 240000)).includes("the clerk read the notice"));
  const big = pdfOf(`E1 control thirty megabytes ${Date.now()}`, 30);
  await uploadAndFile(auth, big, "e1-big.pdf", "application/pdf");
  const end = Date.now() + 120000;
  let r = await readingOf(auth, sha(big));
  while (Date.now() < end && !(r && r.found)) { await later(3000); r = await readingOf(auth, sha(big)); }
  assert.equal(r.found, true);
  assert.equal(r.reading.failure, "final");
  assert.ok(JSON.stringify(r.reading).includes(String(big.length)), "the ceiling states the size");
});

/* ---- E3 ---- */

test("E3 (a 52 MB (over the 50 MiB whole-read ceiling of text, R132; a 40 MB text is deferred, not stated) five-part upload): filed, it states its size as a final reading before any keep has run, and \"Read it\" answers `read: true`", { timeout: 600000 }, async () => {
  const auth = await founder();
  const bytes = textOf(`E3 the commission approved the long minutes ${Date.now()}`, 52);
  const a = await uploadAndFile(auth, bytes, "e3-minutes.txt", "text/plain");
  assert.ok(a.document.parts && a.document.parts.length >= 5);
  const end = Date.now() + 30000;
  let r = await readingOf(auth, sha(bytes));
  while (Date.now() < end && !(r && r.found)) { await later(1500); r = await readingOf(auth, sha(bytes)); }
  assert.equal(r.found, true, "stated within one request or one tick");
  assert.equal(r.reading.failure, "final");
  assert.ok(JSON.stringify(r.reading).includes(String(bytes.length)), "with the size");
  const press = await (await plane("/api/?op=readheld", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ sha: sha(bytes) }) })).json();
  assert.equal(press.result.read === true || press.result.why === "READING_HELD", true, JSON.stringify(press).slice(0, 300));
});
test("E3 (a 41.5 MB five-part address capture): stated final with its size at once, before any keep", { timeout: 600000 }, async () => {
  const auth = await founder();
  const bytes = pdfOf(`E3 capture forty-one megabytes ${Date.now()}`, 41.5);
  served = { "e3-capture.pdf": bytes };
  const res = await plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ locator: "https://www.example.gov/files/e3-capture.pdf" }) });
  const a = await res.json();
  assert.equal(res.status, 200, JSON.stringify(a).slice(0, 400));
  /* fix round 6, G2 (K4562): a 41.5 MB capture is parked and answered at once as being fetched; the alarm's tick files it (no document is answered to promote) and the
     statement is made from its size (G7) */
  assert.ok(a.fetch_pending, JSON.stringify(a).slice(0, 300));
  assert.equal(a.fetch_pending.declared_bytes, bytes.length);
  const end = Date.now() + 120000;
  let r = await readingOf(auth, sha(bytes));
  while (Date.now() < end && !(r && r.found)) { await later(1500); r = await readingOf(auth, sha(bytes)); }
  assert.equal(r.found, true);
  assert.equal(r.reading.failure, "final");
  assert.ok(JSON.stringify(r.reading).includes(String(bytes.length)));
});

/* ---- E5 ---- */

const knock = async (bytes, fileName, mediaType) => {
  const k = await (await plane("/api/?op=knock", { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" },
    body: JSON.stringify({ contentB64: Buffer.from(bytes).toString("base64"), note: "see this", contact: "k@example.org", fileName, ...(mediaType ? { mediaType } : {}) }) })).json();
  const knockResult = k.result ?? k;
  assert.equal(knockResult.ok, true, JSON.stringify(k).slice(0, 300));
  const auth = await founder();
  const pulled = await (await plane("/api/?op=inboxpull", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ knockId: knockResult.knockId }) })).json();
  assert.equal(pulled.ok, true, JSON.stringify(pulled).slice(0, 300));
  return { auth, digest: sha(bytes) };
};
test("E5: a 273-byte text knock, pulled, has its three sentences in the reading, no press; a text knock holding a NUL is not read as text; a `.txt` name with no type is", { timeout: 400000 }, async () => {
  const tag = Date.now();
  const body = `Knock B plain text, ${tag}. The first sentence is here. The second sentence follows it. The third sentence ends the note and fills the file out to size, nothing more.\n`.padEnd(273, " ");
  const { auth, digest } = await knock(te(body), "knock-b.txt", "text/plain");
  const r = await readingWith(auth, digest, "second sentence follows it", 120000);
  assert.equal(r.found, true, JSON.stringify(r).slice(0, 300));
  assert.ok(unitsText(r).includes("first sentence is here") && unitsText(r).includes("third sentence ends the note"));
  const nul = te(`NUL knock ${tag} the hidden words\u0000\u0000 more`);
  const n = await knock(nul, "nul.txt", "text/plain");
  await later(20000);
  assert.equal(unitsText(await readingOf(n.auth, n.digest)).includes("hidden words"), false, "a NUL is not text");
  const bare = await knock(te(`Bare name knock ${tag} words from a name alone`), "bare-name.txt", null);
  assert.ok(unitsText(await readingWith(bare.auth, bare.digest, "words from a name alone", 120000)).includes("words from a name alone"));
});

/* ---- E6 ---- */

test("E6 (a 60-page scan): uploaded and promoted, all 60 pages have text within the alarm's ticks, with no press; the OCR press answers at once", { timeout: 600000 }, async () => {
  const auth = await founder();
  const bytes = scanOf(60);
  ocrCalls.length = 0;
  await uploadAndFile(auth, bytes, "scan60.pdf", "application/pdf");
  const end = Date.now() + 300000;
  let r = await readingOf(auth, sha(bytes));
  const pagesDone = (x) => new Set([...unitsText(x).matchAll(/ocr scan page (\d+) words/g)].map((m) => m[1])).size;
  while (Date.now() < end && pagesDone(r) < 60) { await later(20000); r = await readingOf(auth, sha(bytes)); }
  const owedNow = JSON.stringify(await (await plane(`/api/?op=owedwork&sha=${sha(bytes)}`, { headers: auth })).json()).slice(0, 400);
  assert.equal(pagesDone(r), 60, `all 60 pages have their text (OCR calls: ${ocrCalls.join(",")}; units ${(r.text_units || []).length}; owed ${owedNow})`);
  /* the press on a scan with pages left answers under 2 s (a second scan, 40 pages, pressed before the alarm has gone on) */
  const second = scanOf(40);
  await uploadAndFile(auth, second, "scan40.pdf", "application/pdf");
  const t = Date.now();
  const pressed = await plane(`/api/?op=pdfstructure&sha256=${sha(second)}&ocr=1`, { method: "POST", headers: auth });
  const answer = await pressed.json();
  assert.equal(pressed.status, 200, JSON.stringify(answer).slice(0, 300));
  assert.ok(Date.now() - t < 2000, `answered in ${Date.now() - t} ms`);
});
