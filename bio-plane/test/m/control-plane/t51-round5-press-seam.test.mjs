/* control-plane R125 (b), R117 (fix round 5, E2's press and acquire half; K4533, K4549; CONTROL-PLANE #47; R-SEAM, R-STOP): THE SECOND CAPTURE AND THE PRESS OF A LARGE
   PDF THROUGH THE REAL PLANE. The Worker the product deploys, its object, its alarm and R2 under Miniflare; the network scripted; every input is the member's own act
   through the real door (`acquire`, the capture screen's promotion, "Read it" as `op=readheld`), and the case ends at `op=reading` with no further press.
     1  a ~16 MB, 1,300-page text-layer PDF captured through `acquire` and promoted, then captured a second time: the second answer is made without the door asking the
        object to read (`readheldfor` is absent from its Server-Timing), states `reading_pending`, and the ledger (`owedwork&sha=`) holds the reading entry;
     2  "Read it" on that document answers in under 2 s, the entry owed, never read inline;
     3  the alarm then reads it: `op=reading` has the PDF's words in `text_units` (R-STOP);
     4  control: a ~1 MB PDF captured twice is still read inline on the second capture (R117).
   Red on the door as it was before CONTROL-PLANE #47 (c0b6aaedfb): cases 1 and 2 (the second capture and the press read inside the request). */
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
const ADM = "adm-r5press-0123456789abcdef", PASSWORD = "the founder's long password, round five", ORIGIN = "https://group.example";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const te = (t) => new TextEncoder().encode(t);

/* a text-layer PDF of `pages` pages (each says `words` and its number) filled out to `megabytes` MB by a stream no page names (the reader is xref-free) */
function pdfPages(words, pages, megabytes) {
  const pad = new Uint8Array(Math.floor(megabytes * MB));
  let x = (0x9e3779b9 ^ parseInt(sha(te(words)).slice(0, 8), 16)) >>> 0;
  for (let i = 0; i < pad.length; i++) { x = (x * 1664525 + 1013904223) >>> 0; pad[i] = 0x41 + ((x >>> 24) % 26); }
  const stream = (n, dict, data) => [te(`${n} 0 obj\n<< ${dict} /Length ${data.length} >>\nstream\n`), data, te("\nendstream\nendobj\n")];
  const plain = (n, body) => [te(`${n} 0 obj\n${body}\nendobj\n`)];
  const toUni = "/CIDInit /ProcSet findresource begin 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <20> <7E> <0020> endbfrange end";
  const kids = Array.from({ length: pages }, (_, i) => `${1000 + i} 0 R`).join(" ");
  const parts = [te("%PDF-1.7\n"), ...plain(1, "<< /Type /Catalog /Pages 2 0 R >>"), ...plain(2, `<< /Type /Pages /Kids [${kids}] /Count ${pages} >>`),
    ...plain(10, `<< /Type /Font /Subtype /TrueType /BaseFont /Plain /FirstChar 32 /Widths [${Array(95).fill(500).join(" ")}] /ToUnicode 11 0 R >>`), ...stream(11, "", te(toUni))];
  for (let i = 0; i < pages; i++) {
    parts.push(...plain(1000 + i, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 10 0 R >> >> /Contents ${5000 + i} 0 R >>`),
      ...stream(5000 + i, "", te(`BT /F1 12 Tf 72 700 Td (${words} page ${i + 1}) Tj ET`)));
  }
  parts.push(...stream(500, "", pad), te("trailer\n<< /Root 1 0 R >>\n%%EOF\n"));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
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
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r5press-0123456789abcdef", PROBE_TOKEN: "prb-r5press-0123456789abcdef", VERSION: "4.7.5",
              INSTANCE_NAME: "r5press-town", KNOCK_FINGERPRINT_KEY: "r5press-fingerprint-key", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
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
/* the member's act: capture the address through `acquire`, then file the document the answer carries as the capture screen files it */
async function acquire(auth, locator) {
  const res = await plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ locator }) });
  const t = Date.now();
  const body = await res.json();
  return { res, body, status: res.status, ms: Date.now() - t, timing: res.headers.get("server-timing") || "" };
}
async function promote(auth, a, title) {
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screenCall(auth), { doc: a.document, title, locator: a.document.locator, project: "" });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
}
const owedOf = async (auth, digest) => JSON.stringify(await (await plane(`/api/?op=owedwork&sha=${digest}`, { headers: auth })).json());

/* the 16 MB, 1,300-page capture is made once: the cases follow one another on one document, as the member's presses do */
const WORDS = `R125 the council adopted the budget resolution ${Date.now()}`;
const big = pdfPages(WORDS, 1300, 16);
const BIG = sha(big);
const BIG_NAME = "r125-press-big.pdf";
const BIG_LOCATOR = `https://www.example.gov/files/${BIG_NAME}`;
let bigAuth = null;

test("R125 (b) (a 16 MB, 1,300-page PDF captured twice through `acquire`): the second capture is not read inside the request, states `reading_pending`, and the ledger holds the reading entry", { timeout: 600000 }, async () => {
  const auth = bigAuth = await founder();
  served = { [BIG_NAME]: big };
  const first = await acquire(auth, BIG_LOCATOR);
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 400));
  assert.equal(first.body.document.capture.sha256, BIG);
  assert.ok(first.body.document.parts && first.body.document.parts.length >= 2, "held in parts, the shape that reached the inline read");
  await promote(auth, first.body, BIG_NAME);
  const second = await acquire(auth, BIG_LOCATOR);
  assert.equal(second.status, 200, JSON.stringify(second.body).slice(0, 400));
  assert.equal(second.body.ok, true);
  assert.equal(second.body.document.capture.sha256, BIG);
  assert.ok(!/do-readheldfor/.test(second.timing), `the door did not ask the object to read inside the request: ${second.timing}`);
  assert.equal(second.body.reading_pending, true, `the answer states the reading is pending: ${JSON.stringify(second.body).slice(0, 300)}`);
  /* the entry: the door wrote it (`pendingadd`, its Server-Timing metric) and the alarm, which the real plane runs at once, has read it and drawn it from the ledger by now */
  assert.ok(/do-pendingadd/.test(second.timing), `the door wrote the reading down in the ledger: ${second.timing}`);
  assert.ok(!/"state":"final"/.test(await owedOf(auth, BIG)), "and no entry of it ended for a reason");
});

test("R125 (c) ('Read it' on that 16 MB document): answered in under 2 s, never read inline", { timeout: 600000 }, async () => {
  /* In the real plane the alarm has read the document before the member can press (a 16 MB reading is ~1 s), so the press finds the reading held and owes nothing;
     the unread case (`READING_PENDING`, the entry written, `reading_pending: true`) is asserted when the press is early enough to meet it. Either way the press
     never reads: its answer is `read: false` and not a second over 2 s. */
  const auth = bigAuth || await founder();
  const t = Date.now();
  const res = await plane("/api/?op=readheld", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ sha: BIG }) });
  const press = await res.json();
  const ms = Date.now() - t;
  assert.equal(res.status, 200, JSON.stringify(press).slice(0, 300));
  assert.ok(ms < 2000, `the press answered in ${ms} ms`);
  assert.ok(!/do-readheldfor/.test(res.headers.get("server-timing") || ""), `no inline read: ${res.headers.get("server-timing")}`);
  assert.ok(press.result && press.result.ok === true && press.result.read !== true, `never read inline: ${JSON.stringify(press).slice(0, 300)}`);
  assert.ok(press.result.reading_pending === true || press.result.why === "READING_HELD", `owed, or already held: ${JSON.stringify(press).slice(0, 300)}`);
});

test("R125 (the alarm reads it): `op=reading` of the 16 MB document has the PDF's words in its text units (R-STOP)", { timeout: 600000 }, async () => {
  const auth = bigAuth || await founder();
  const r = await readingWith(auth, BIG, "the council adopted the budget resolution", 420000);
  assert.equal(r.found, true, JSON.stringify(r).slice(0, 400));
  assert.ok(unitsText(r).includes("the council adopted the budget resolution"), `its words are in the text units: ${JSON.stringify(r.reading).slice(0, 300)}`);
  assert.notEqual(r.reading && r.reading.failure, "final");
});

test("R117 (control: a 1 MB PDF captured twice): the second capture is still read inline", { timeout: 600000 }, async () => {
  const auth = await founder();
  const small = pdfPages(`R117 control the clerk filed the notice ${Date.now()}`, 3, 1);
  const name = "r117-press-small.pdf";
  served = { ...served, [name]: small };
  const first = await acquire(auth, `https://www.example.gov/files/${name}`);
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 400));
  await promote(auth, first.body, name);
  const second = await acquire(auth, `https://www.example.gov/files/${name}`);
  assert.equal(second.status, 200, JSON.stringify(second.body).slice(0, 400));
  assert.ok(/do-readheldfor/.test(second.timing), `a capture that fits is asked of the object inline: ${second.timing}`);
  assert.notEqual(second.body.reading_pending, true, "a reading that fits is not owed");
  assert.ok(unitsText(await readingWith(auth, sha(small), "the clerk filed the notice", 60000)).includes("the clerk filed the notice"));
});
