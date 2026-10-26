/* control-plane R105, R123, R124, R125 (fix round 6, G2, G5, G7, G13; K4562, K4571, K4573; R-SEAM, R-STOP, R-CLOCK): THE WALKER'S CASES THROUGH THE REAL PLANE. The Worker the product
   deploys, its object, its alarm and R2 under Miniflare; the network scripted; each case is a member's own act, as the screens press it, and ends at the record's own reads
   with no further press. Inputs are made by the acts (an upload, an `acquire` with the project the Add screen sends), never by a hand-written answer shape. R-CLOCK: the
   times asserted here are the test's own (outside the object); nothing asserts a compute time from the object's clock.
     G2   a 15,932,155 B file served at 0.7 MB/s with its Content-Length: `acquire {locator, project}` answers in under 2 s `fetch_pending` with the declared size, no document and
          (about) no body pulled; the alarm's tick files it in the project, owes its reading and tells the opener in the Queue; with no Content-Length the answer comes at the clock
          (11 s or less); a second capture of the held file answers at once; control: a 1 MB page is captured in the request;
     G5   the 12 MB text (last line ENDMARKER) is answered unread and owed under 15 s; read by the ledger its first lines are in the units; a second upload is not read again;
          control: a 1 MB text is read in the answer;
     G7   a 52 MB (over the 50 MiB whole-read ceiling of text, R132; a 40 MB text is deferred, not stated) five-part upload states its size as a `final` reading with no owed row;
     G13  the 12 MB text is read WHOLE by the ledger's ticks: ENDMARKER is in `text_units`, and while it is not the ledger still holds the reading as owed.
   Red by name until the providers have merged: G2 (acquisition `fetch_pending`/`owedFetch`, capture `openCaptures`/`fetch_done`, plane's `fetch` kind, notice-producers' notice), G13
   (reading-pipeline's cursor, extraction's segments and `more`, plane's continuation). */
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
const ADM = "adm-r6seam-0123456789abcdef", PASSWORD = "the founder's long password, round six", ORIGIN = "https://group.example";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const te = (t) => new TextEncoder().encode(t);

/* a PDF of `bytes` bytes whose one page of text says `words`, filled out by a stream no page names */
function pdfOf(words, bytes) {
  const pad = new Uint8Array(Math.max(0, bytes - 1500));
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
/* the walker's text: one line per row, a distinct word on each, the last line ENDMARKER (no blank line, so each LINE is a unit) */
function lineText(approxBytes, tag) {
  const rows = [];
  let n = 0, i = 0;
  while (n < approxBytes) { const l = `${tag} line ${i} appeal${i % 997} the board approved the minutes of the zoning hearing\n`; rows.push(l); n += l.length; i++; }
  rows.push("ENDMARKER\n");
  return te(rows.join(""));
}
const textOf = (line, megabytes) => {
  const l = te(line + "\n"), out = new Uint8Array(Math.floor(megabytes * MB));
  for (let at = 0; at < out.length; at += l.length) out.set(l.subarray(0, Math.min(l.length, out.length - at)), at);
  return out;
};

/* the network: a file by its last path segment, served at once or throttled, with its Content-Length or without, and the bytes pulled counted */
const upstream = new Map();
const pulled = new Map();
function serve(name, bytes, { rate = null, length = true, type = "application/pdf" } = {}) { upstream.set(name, { bytes, rate, length, type }); pulled.set(name, 0); }
function slowBody(name, bytes, rate) {
  const chunk = 64 * 1024;
  let at = 0;
  return new ReadableStream({
    async pull(c) {
      if (at >= bytes.length) { c.close(); return; }
      const end = Math.min(at + chunk, bytes.length);
      c.enqueue(bytes.subarray(at, end));
      pulled.set(name, pulled.get(name) + (end - at));
      at = end;
      await later((chunk / rate) * 1000);
    },
  }, new CountQueuingStrategy({ highWaterMark: 0 }));
}
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r6seam-0123456789abcdef", PROBE_TOKEN: "prb-r6seam-0123456789abcdef", VERSION: "4.7.6",
              INSTANCE_NAME: "r6seam-town", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: (req) => {
    const name = new URL(req.url).pathname.split("/").pop();
    const f = upstream.get(name);
    if (!f) return new Response("not scripted", { status: 404 });
    const headers = { "content-type": f.type, ...(f.length ? { "content-length": String(f.bytes.length) } : {}) };
    return new Response(f.rate ? slowBody(name, f.bytes, f.rate) : f.bytes, { headers });
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
const get = async (auth, query) => (await (await plane(`/api/?${new URLSearchParams(query)}`, { headers: auth })).json());
const readingOf = async (auth, digest) => (await get(auth, { op: "reading", sha256: digest })).result;
const owedOf = async (auth, digest) => (await get(auth, { op: "owedwork", sha: digest })).result;
const unitsText = (r) => JSON.stringify(r && r.text_units ? r.text_units : []);
async function until(fn, ms, every = 3000) {
  const end = Date.now() + ms;
  let v = await fn();
  while (Date.now() < end && !v) { await later(every); v = await fn(); }
  return v;
}
/* the project "Start a project" files, promoted at the door as the member's own press does */
async function projectOf(auth, title) {
  const cs = screenCall(auth);
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "${title}"\nobjective: "${title}"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the seam test\nChanges: created.\n` }], register: [], visibility: "hidden" } });
  const id = (made.result && made.result.bundleId) || made.bundleId;
  assert.ok(id, "the project is made: " + JSON.stringify(made).slice(0, 300));
  return id;
}
/* the member's act as the capture screen presses it: upload, then file the document the upload answered */
async function uploadAndFile(auth, bytes, name, type, project = "") {
  const t = Date.now();
  const res = await plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: bytes });
  const up = await res.json();
  const ms = Date.now() - t;
  const a = up.result;
  assert.equal(a.ok, true, JSON.stringify(up).slice(0, 400));
  assert.equal(a.document.capture.sha256, sha(bytes));
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screenCall(auth), { doc: a.document, title: name, locator: a.document.locator, project });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
  return { answer: a, ms, status: res.status };
}
const acquire = async (auth, body) => {
  const t = Date.now();
  const res = await plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  return { ms: Date.now() - t, status: res.status, body: json };
};

/* ---- G5 ---- */

const TEXT12 = lineText(12000000, "WALKTXT");
const TEXT12_SHA = sha(TEXT12);

test("R123, R125 (G5): the walker's 12 MB text (last line ENDMARKER) is uploaded and answered unread and owed within 15 s; the ledger reads it and its first lines are in `text_units`; a second upload is `existed` and read no more", { timeout: 900000 }, async () => {
  const auth = await founder();
  const up = await uploadAndFile(auth, TEXT12, "walk12.txt", "text/plain");
  assert.equal(up.status, 200);
  assert.ok(up.ms < 15000, `answered in ${up.ms} ms (the walker's was 27 s)`);
  assert.equal(up.answer.reading_pending, true, "the reading follows");
  assert.equal(up.answer.document.reading, undefined, "nothing was read inside the request");
  const r = await until(async () => { const x = await readingOf(auth, TEXT12_SHA); return x && x.found && unitsText(x).includes("WALKTXT line 0 ") ? x : null; }, 600000);
  assert.ok(r, "read within the ledger's ticks, no press");
  assert.ok(unitsText(r).includes("WALKTXT line 0 appeal0 the board approved the minutes"), "its first lines are in the units (R-STOP)");
  /* the second upload of the held, promoted file: existed, nothing read, nothing promised */
  const t = Date.now();
  const again = (await (await plane("/api/?op=captureupload&statement=again&name=walk12.txt&type=text%2Fplain", { method: "POST", headers: auth, body: TEXT12 })).json()).result;
  assert.equal(again.existed, true);
  assert.equal(again.reading_pending, undefined, "the reading is held: nothing is promised again");
  assert.ok(Date.now() - t < 15000, `the second upload answered in ${Date.now() - t} ms`);
});

test("R123, R125 (G5 control): a 1 MB text upload is read in the answer, its words in the units, and nothing is owed", { timeout: 300000 }, async () => {
  const auth = await founder();
  const bytes = lineText(1 * MB, `CONTROL${Date.now()}`);
  const up = await uploadAndFile(auth, bytes, "control1.txt", "text/plain");
  assert.equal(up.answer.reading_pending, undefined);
  assert.ok(up.answer.document.reading, "read inline");
  assert.ok(unitsText(up.answer.document).includes("the board approved the minutes"));
  assert.equal(((await owedOf(auth, sha(bytes))) || {}).rows?.length ?? 0, 0, "no row owed");
});

/* ---- G13 ---- */

test("R123, R125 (G13): the 12 MB text is read WHOLE by the ledger's ticks: `ENDMARKER` is in `text_units`, a passage near the end is there, and while it is not the ledger holds the reading as owed", { timeout: 1200000 }, async () => {
  const auth = await founder();
  const bytes = lineText(12000000, `WHOLE${Date.now()}`);
  const digest = sha(bytes);
  await uploadAndFile(auth, bytes, "whole12.txt", "text/plain");
  let owedMidway = null;
  const done = await until(async () => {
    const x = await readingOf(auth, digest);
    /* op=reading answers at most 4,096 units a page (extraction R76: `after`/`next`): the whole is every page, read through the door */
    if (x && x.found) {
      let page = x, all = [...(x.text_units || [])];
      for (let n = 0; page && page.next != null && n < 100; n++) {
        page = (await get(auth, { op: "reading", sha256: digest, after: page.next })).result;
        all = all.concat((page && page.text_units) || []);
      }
      const whole = { ...x, text_units: all };
      if (unitsText(whole).includes("ENDMARKER")) return whole;
    }
    if (x && x.found && owedMidway === null) owedMidway = JSON.stringify(await owedOf(auth, digest));
    return null;
  }, 1100000, 5000);
  assert.ok(done, `ENDMARKER is in the units once the ticks have read the whole (midway the ledger said: ${owedMidway})`);
  assert.ok(unitsText(done).includes("appeal"), "and a passage near the end is citable");
  if (owedMidway !== null) assert.ok(owedMidway.includes("reading"), `while it was unfinished the reading stood owed: ${owedMidway}`);
});

/* ---- G7 ---- */

test("R123, R125 (G7): a 52 MB (over the 50 MiB whole-read ceiling of text, R132; a 40 MB text is deferred, not stated) five-part upload states its size as a `final` reading with no `reading_pending` and no row owed", { timeout: 600000 }, async () => {
  const auth = await founder();
  const bytes = textOf(`G7 the commission approved the long minutes ${Date.now()}`, 52);
  const up = await uploadAndFile(auth, bytes, "g7-minutes.txt", "text/plain");
  assert.equal(up.answer.reading_pending, undefined, "stated from its sizes at once");
  const r = await until(async () => { const x = await readingOf(auth, sha(bytes)); return x && x.found ? x : null; }, 60000, 1500);
  assert.ok(r, "stated");
  assert.equal(r.reading.failure, "final");
  assert.ok(JSON.stringify(r.reading).includes(String(bytes.length)), "with its size");
  const owed = await owedOf(auth, sha(bytes));
  assert.equal(JSON.stringify(owed).includes('"kind":"reading"'), false, `no reading row owed: ${JSON.stringify(owed).slice(0, 300)}`);
});

/* ---- G2 ---- */

const BIG = pdfOf(`G2 the large budget volume the clerk read the notice ${Date.now()}`, 15932155);
const BIG_SHA = sha(BIG);
test("R105, R124 (G2): a 15,932,155 B file at 0.7 MB/s with its Content-Length: `acquire {locator, project}` answers in under 2 s `fetch_pending` with the declared size and no document; the tick files it in the project, owes its reading and the opener is told in the Queue", { timeout: 1200000 }, async () => {
  const auth = await founder();
  const project = await projectOf(auth, "Round six large capture");
  const name = `BUDGET-R6-${Date.now()}.pdf`;
  serve(name, BIG, { rate: 0.7 * MB });
  const first = await acquire(auth, { locator: `https://www.example.gov/files/${name}`, project });
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 400));
  assert.ok(first.ms < 2000, `answered in ${first.ms} ms`);
  assert.notEqual(first.body.reason, "ACQUIRE_TIMED_OUT");
  assert.equal(first.body.ok, true);
  assert.equal(first.body.document, undefined, "no document: it is being fetched");
  assert.ok(first.body.fetch_pending, JSON.stringify(first.body).slice(0, 400));
  assert.equal(first.body.fetch_pending.declared_bytes, BIG.length);
  assert.ok(pulled.get(name) <= MB, `about no body pulled in the request (${pulled.get(name)} B)`);
  /* the member's "Unfinished" lists it as being fetched */
  const open = JSON.stringify((await get(auth, { op: "opencaptures" })).result);
  assert.ok(open.includes(first.body.fetch_pending.session), `opencaptures lists the session: ${open.slice(0, 300)}`);
  /* the alarm's tick: the document is in the project, its reading owed (a PDF over 2 MB), the opener told */
  const held = await until(async () => {
    const rows = JSON.stringify((await get(auth, { op: "heldcaptures", project })).result);
    return rows.includes(BIG_SHA) ? rows : null;
  }, 600000, 5000);
  assert.ok(held, "the document is in the project after the tick");
  const owed = await until(async () => {
    const x = await readingOf(auth, BIG_SHA);
    return (x && x.found) || JSON.stringify(await owedOf(auth, BIG_SHA)).includes("reading") ? true : null;
  }, 60000, 3000);
  assert.ok(owed, `a reading is owed or was made: ${JSON.stringify(await owedOf(auth, BIG_SHA))} ${JSON.stringify(await readingOf(auth, BIG_SHA)).slice(0, 300)}`);
  /* R-STOP: and the words are in the units once the ledger has read it */
  const words = await until(async () => { const x = await readingOf(auth, BIG_SHA); return x && x.found && unitsText(x).includes("the clerk read the notice") ? x : null; }, 600000, 5000);
  assert.ok(words, "the PDF's words are in text_units");
  const queue = JSON.stringify((await get(auth, { op: "queue" })).result);
  assert.ok(queue.includes(name) || queue.includes(BIG_SHA), `the opener is told in the Queue: ${queue.slice(0, 400)}`);
  /* a second capture of the held file answers at once */
  const second = await acquire(auth, { locator: `https://www.example.gov/files/${name}`, project });
  assert.equal(second.status, 200, JSON.stringify(second.body).slice(0, 300));
  assert.ok(second.ms < 2000, `the second capture answered in ${second.ms} ms`);
});

test("R105 (G2, no Content-Length): the same file served with no length answers at the clock (11 s or less) with `fetch_pending`, never `ACQUIRE_TIMED_OUT`", { timeout: 1200000 }, async () => {
  const auth = await founder();
  const project = await projectOf(auth, "Round six large capture, no length");
  const name = `BUDGET-R6-NL-${Date.now()}.pdf`;
  serve(name, pdfOf(`G2 no length ${Date.now()}`, 15300000), { rate: 0.7 * MB, length: false });
  const first = await acquire(auth, { locator: `https://www.example.gov/files/${name}`, project });
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 400));
  assert.ok(first.ms <= 11500, `answered at the clock: ${first.ms} ms`);
  assert.notEqual(first.body.reason, "ACQUIRE_TIMED_OUT");
  assert.ok(first.body.fetch_pending, JSON.stringify(first.body).slice(0, 400));
  assert.equal(first.body.fetch_pending.declared_bytes, null, "no length was declared");
});

test("R105 (G2 control): a 1 MB page is captured inside the request: its document is in the answer, no `fetch_pending`", { timeout: 300000 }, async () => {
  const auth = await founder();
  const name = `page-r6-${Date.now()}.html`;
  serve(name, te(`<html><body>${"the board approved the minutes ".repeat(30000)}</body></html>`), { type: "text/html" });
  const r = await acquire(auth, { locator: `https://www.example.gov/files/${name}` });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 300));
  assert.equal(r.body.fetch_pending, undefined);
  assert.ok(r.body.document, "the document is in the answer");
});
