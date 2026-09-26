/* ocr-worker.test.mjs — the member's requirements (build/requirements/ocr-worker.md), each tested at the
 * member's interface and named by its id.
 *
 * TWO HALVES, ONE SUBJECT.
 *   Part A drives `makeMember` (`src/member.mjs`, the handler and the one-page pipeline, which import no engine)
 *   in node, through its `fetch`, with a recording `CAPTURES` and, where a step cannot be reached any other way,
 *   a stand-in renderer or engine. It reaches every refusal R7 orders — including the two the real renderer never
 *   produces (a container other than PNG, a PNG its reader refuses) — and proves what the member touches (R15,
 *   R16, R21) rather than what its source says.
 *   Part B boots the COMMITTED BUNDLE from its three upload parts under workerd (miniflare) with the real engine
 *   and the real renderer, over a real scanned page, and over broken installs (a wrong model, a wasm core that did
 *   not arrive compiled).
 *
 * IT DOES NOT MEASURE ACCURACY. The fidelity this member reports is CPDF-15's measurement (MEASUREMENTS.md
 * 2026-09-10), whose reach is ONE human-ground-truthed page, ONE engine version, ONE model. The text arms below are
 * PINS on that known page (the two strings CPDF-11 measured a generative model minting wrong on it), not a score.
 *
 * THE ONE EXPECTATION THAT DOES NOT COME FROM THE SUBJECT: `IND_UPRIGHT_SHA`, the page's samples as an
 * INDEPENDENT decoder produced them (Pillow/libtiff CCITT G4 through pypdf 6.14.2 / Pillow 11.3.0, 2026-08-08,
 * CPDF-12). If the fixture changes, it is re-derived from the independent decoder, never from a failing run.
 *
 * Run: node test/ocr-worker.test.mjs
 */
import "../../bio-plane/test/sandbox.mjs";  /* test-support: owns $TMPDIR, synchronous stdio */

import { Miniflare } from "miniflare";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { ocrWorkerDef, WASM, MODEL } from "./memberworker.mjs";
import { makeMember, NAMESPACES } from "../src/member.mjs";
import { MEASURED_BY, MAX_FRAME_BYTES, REFUSALS } from "../src/contract.mjs";
import { renderPageToPixels } from "../../pdf-worker/src/pagepixels.mjs";
import { checkAnchor, checkConfidence } from "../../bio-plane/src/textchain.mjs";
import { BASIS_GRADES } from "../../bio-plane/checks/bio-checks.mjs";
import { discoverMembers, verifyStatic } from "../../bio-plane/scripts/fleet-bundle.mjs";

const hex = (b) => createHash("sha256").update(b).digest("hex");
const F = (p) => new Uint8Array(readFileSync(fileURLToPath(new URL(p, import.meta.url))));

let pass = 0, fail = 0, footReached = false;
/* THE FOOT SENTINEL: a TypeError inside an assertion ends the module through no assertion at all; this prints a
   tally WITH a failure in that case, so silence never reads as green. */
process.on("exit", () => {
  if (!footReached) console.log(`\nocr-worker: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const keys = (o) => Object.keys(o || {}).sort();

/* Every wire answer this suite sees, for R20. */
const WIRE = [];

/* ============================================================================================================ *
 * Fixtures
 * ============================================================================================================ */

/* THE REAL PAGE: page 2 of Oakland Legistar attachment 15721260, the scanned council resolution CPDF-9
   ground-truthed and CPDF-15 measured this engine on (provenance, not behaviour: layers.md rule 6). */
const SCAN = F("../../pdf-worker/test/fixtures/scan-ccitt-g4-page.pdf");
const SCAN_SHA = hex(SCAN);
const IND_UPRIGHT_SHA = "ac4eb57f0f966f5d5b07eca8c97b065ab56746f32cfe33f3ba8b31cd1579efbc";

function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), Buffer.from(o.stream),
                  Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
/** A one-page image-only PDF: one 1-bit FlateDecode image of the given size, filled from `fill(byteIndex)`. */
function bilevelPagePdf(width, height, fill) {
  const raw = Buffer.alloc(Math.ceil(width / 8) * height);
  for (let i = 0; i < raw.length; i++) raw[i] = fill(i);
  const data = deflateSync(raw);
  const content = Buffer.from(`q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q`, "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] `
                  + `/Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>` },
    { num: 4, head: `<< /Length ${content.length} >>`, stream: content },
    { num: 5, head: `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} `
                  + `/ColorSpace /DeviceGray /BitsPerComponent 1 /Filter /FlateDecode /Length ${data.length} >>`,
      stream: data },
  ]);
}
/** A one-page PDF with a real text layer and no image. */
function textPagePdf() {
  const content = Buffer.from("BT /F1 12 Tf 72 700 Td (Hello) Tj ET", "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                  + "/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${content.length} >>`, stream: content },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
  ]);
}
function lcg(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) >>> 24; }

const BLANK = bilevelPagePdf(1200, 1600, () => 0xff);
const NOISE = (() => { const r = lcg(11); return bilevelPagePdf(1200, 1600, () => r()); })();
/* 5000 x 5000 is a 100,000,000 B RGBA frame, past the 75.7 MB frame CPDF-15 measured being KILLED. A real,
   decodable page: a refusal that fired because the renderer failed would prove nothing about the bound. */
const HUGE = bilevelPagePdf(5000, 5000, () => 0xff);
const TEXTY = textPagePdf();
const NOT_PDF = new TextEncoder().encode("this is not a PDF at all, just bytes in the bucket");

/* ---- a PNG writer, for the stand-in renderer: every shape the member's reader accepts or refuses ---------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, "latin1"); Buffer.from(data).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
/** `rows` is an array of scanlines WITHOUT filter bytes; `filter` is the byte each is written with. */
function png({ width, height, bitDepth = 8, colorType = 0, interlace = 0, rows, filter = 0, idat = true,
               ihdr = true, truncate = false }) {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0); head.writeUInt32BE(height, 4);
  head[8] = bitDepth; head[9] = colorType; head[10] = 0; head[11] = 0; head[12] = interlace;
  const raw = Buffer.concat(rows.map((r) => Buffer.concat([Buffer.from([filter]), Buffer.from(r)])));
  const parts = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])];
  if (ihdr) parts.push(chunk("IHDR", head));
  if (idat) parts.push(chunk("IDAT", deflateSync(raw)));
  parts.push(chunk("IEND", Buffer.alloc(0)));
  const all = Buffer.concat(parts);
  return new Uint8Array(truncate ? all.subarray(0, all.length - 20) : all);
}
const GREY4x3 = png({ width: 4, height: 3, rows: [[0, 64, 128, 255], [1, 2, 3, 4], [9, 8, 7, 6]] });
const RGB2x2 = png({ width: 2, height: 2, colorType: 2, rows: [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]] });
const BILEVEL9x2 = png({ width: 9, height: 2, bitDepth: 1, rows: [[0b10110000, 0b10000000], [0xff, 0x00]] });

/* ============================================================================================================ *
 * Part A — the member's code in node: `makeMember`, a recording bucket, stand-ins where a step needs one
 * ============================================================================================================ */

const REAL_ENGINE_NAMES = { name: "tesseract-wasm", version: "0.11.0", model: "tessdata_fast/eng" };

/** A stand-in engine. `regions` is what `transcribeFrame` answers; `calls` records every frame it was given. */
function stubEngine({ regions = [], check = null, frame = null, boxCount } = {}) {
  const e = { ...REAL_ENGINE_NAMES, calls: [], checks: 0 };
  e.check = () => { e.checks++; return check; };
  e.transcribeFrame = async (rgba, width, height, opts) => {
    e.calls.push({ length: rgba.length, width, height, rgba: Array.from(rgba.slice(0, 128)), opts });
    if (frame) return frame(rgba, width, height, opts);
    return { ok: true, regions, grain: "line", boxCount: boxCount ?? regions.length };
  };
  return e;
}
/** A stand-in renderer answering `answer` (a function of the page, or a value), recording every call. */
function stubRender(answer) {
  const r = async (bytes, page, opts) => { r.calls.push({ page, opts, bytes: bytes.length });
    return typeof answer === "function" ? answer(page) : answer; };
  r.calls = [];
  return r;
}
const pngPage = (bytes, width, height, extra = {}) => ({
  ok: true, route: "stub-route", mediaType: "image/png", bytes, width, height, upright: true, rotate_deg: 0,
  pixels_sha256: "f".repeat(64), page_geometry: { dpi: 300 }, ...extra });

/** A bucket that records every property touched on it, and answers `.get` from `objects`. */
function recordingBucket(objects = new Map()) {
  const log = [];
  const target = {
    get: async (key) => { log.push(["get", key]); const b = objects.get(key);
      return b ? { arrayBuffer: async () => b.slice().buffer } : null; },
  };
  const proxy = new Proxy(target, { get(o, p) { log.push(["touch", String(p)]); return o[p]; } });
  return { proxy, log, objects };
}
const DOC = new Uint8Array([37, 80, 68, 70, 45]);   /* the bytes are opaque to the member: the renderer reads them */
const DOC_SHA = hex(DOC);

/** POST a body to a member made over `engine` and `render`, in `env`; returns {status, body}. */
async function post(member, env, body, path = "/transcribe") {
  const r = await member.fetch(new Request(`http://ocr-worker${path}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body) }), env);
  const out = { status: r.status, body: await r.json() };
  WIRE.push(out.body);
  return out;
}
function world({ engine = stubEngine({ regions: [{ text: "a line", rect: [0, 0, 2, 1], confidence: 0.5 }] }),
                 render = stubRender(pngPage(GREY4x3, 4, 3)), env = {} } = {}) {
  const bucket = recordingBucket(new Map([[`scratch/captures/${DOC_SHA}`, DOC], [`bio/captures/${DOC_SHA}`, DOC]]));
  const member = makeMember(engine, { render });
  return { engine, render, bucket, member, env: { CAPTURES: bucket.proxy, VERSION: "stub-build", ...env },
           ask: (body, path) => post(member, { CAPTURES: bucket.proxy, VERSION: "stub-build", ...env }, body, path) };
}
const good = (over = {}) => ({ capture_sha: DOC_SHA, store: "scratch", pages: [0], ...over });

/* R21's fence: no network call of any kind while the member runs. */
const realFetch = globalThis.fetch;
const netCalls = [];
globalThis.fetch = async (...a) => { netCalls.push(String(a[0])); throw new Error("no network in this suite"); };

try {

console.log("\n--- A1 · R1: capture_sha — 64 hex, case-insensitive, checked before the store and the pages ---");
{
  const w = world();
  for (const [label, sha] of [["absent", undefined], ["63 hex", "a".repeat(63)], ["65 hex", "a".repeat(65)],
                              ["not hex", "g".repeat(64)], ["a number", 7], ["null", null], ["an array", ["a"]]]) {
    const r = await w.ask({ capture_sha: sha, store: "scratch", pages: [0] });
    t(`R1 capture_sha ${label} -> 400 BAD_SHA`, [r.status, r.body.ok, r.body.reason], [400, false, "BAD_SHA"]);
  }
  const notJson = await w.ask("{not json");
  t("R1 a body that is not JSON -> 400 BAD_SHA", [notJson.status, notJson.body.reason], [400, "BAD_SHA"]);
  const first = await w.ask({ capture_sha: "nope", store: 7 });
  t("R1 BAD_SHA is checked BEFORE the store and the pages (bad store, no pages still reads BAD_SHA)",
    [first.status, first.body.reason], [400, "BAD_SHA"]);
  t("R1 and nothing was read for any of them", w.bucket.log.filter(([k]) => k === "get"), []);
  const upper = await w.ask(good({ capture_sha: DOC_SHA.toUpperCase() }));
  t("R1 an UPPER-CASE sha is accepted and normalised to lower case before use",
    [upper.status, upper.body.ok, w.bucket.log.filter(([k]) => k === "get").map(([, key]) => key)],
    [200, true, [`scratch/captures/${DOC_SHA}`]]);
}

console.log("\n--- A2 · R2, R3, R16: the store is named, and it is exactly `bio` or `scratch` ---");
{
  const w = world();
  for (const [label, store] of [["absent", undefined], ["a number", 7], ["null", null], ["an object", {}],
                                ["an array", ["bio"]], ["a boolean", true]]) {
    const r = await w.ask({ capture_sha: DOC_SHA, store, pages: [0] });
    t(`R2 store ${label} -> 400 BAD_STORE`, [r.status, r.body.ok, r.body.reason], [400, false, "BAD_STORE"]);
  }
  const noPages = await w.ask({ capture_sha: DOC_SHA });
  t("R2 BAD_STORE is answered before the pages are looked at", noPages.body.reason, "BAD_STORE");

  /* R3/R16: the unknown names are driven with bytes sitting under that exact key, so a member that spent the name
     on R2 would find them. The recording bucket shows it never asked. */
  for (const name of ["biosmoke", "Scratch", "BIO", "bio ", " scratch", "bio_smoke", "biosmoke-fleet", "", "not a token"])
    w.bucket.objects.set(`${name}/captures/${DOC_SHA}`, DOC);
  const before = w.bucket.log.length;
  for (const name of ["biosmoke", "Scratch", "BIO", "bio ", " scratch", "bio_smoke", "biosmoke-fleet", "", "not a token"]) {
    const r = await w.ask({ capture_sha: DOC_SHA, store: name, pages: [0] });
    t(`R3 R16 store ${JSON.stringify(name)} -> 400 NAMESPACE_UNKNOWN, asked and namespaces named`,
      [r.status, r.body.ok, r.body.reason, r.body.asked, r.body.namespaces],
      [400, false, "NAMESPACE_UNKNOWN", name, ["bio", "scratch"]]);
  }
  t("R3 R16 and the bucket was never addressed for any of them, though bytes sit under each key",
    w.bucket.log.slice(before).filter(([k]) => k === "get"), []);
  const long = await w.ask({ capture_sha: DOC_SHA, store: "x".repeat(200), pages: [0] });
  t("R3 `asked` is truncated to 80 characters", [long.body.reason, long.body.asked], ["NAMESPACE_UNKNOWN", "x".repeat(80)]);
  const unknown = await w.ask({ capture_sha: DOC_SHA, store: "biosmoke", pages: [0] });
  t("R3 R5 the detail says which fact this is — not NOT_FOUND",
    [/NOT_FOUND/.test(unknown.body.detail), unknown.body.detail === REFUSALS.NAMESPACE_UNKNOWN], [true, true]);
  for (const name of ["bio", "scratch"]) {
    const r = await w.ask({ capture_sha: DOC_SHA, store: name, pages: [0] });
    t(`R16 the namespace \`${name}\` exists and is read`, [r.status, r.body.ok], [200, true]);
  }
  t("R16 the member's set is exactly the two names, frozen", [[...NAMESPACES], Object.isFrozen(NAMESPACES)],
    [["bio", "scratch"], true]);

  /* THE COPY AGES: the plane's own set, read from its source (the plane is a later module and cannot be imported),
     must equal the set this member states on the wire. */
  const PLANE = readFileSync(fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url)), "utf8");
  const scratchName = (PLANE.match(/^const SCRATCH = "([^"]+)";$/m) || [])[1];
  const planeSet = ((PLANE.match(/^const NAMESPACES = Object\.freeze\(\[([^\]]*)\]\);$/m) || [])[1] || "")
    .split(",").map((x) => x.trim()).filter(Boolean).map((x) => (x === "SCRATCH" ? scratchName : JSON.parse(x)));
  t("R16 the plane's namespace set was read (not an empty corpus)", planeSet.length >= 2, true);
  t("R16 the set this member refuses with EQUALS the plane's `namespaceGate` set", unknown.body.namespaces, planeSet);
}

console.log("\n--- A3 · R4, R6: pages — a non-empty array; ONE page per call, the lowest; the rest deferred ---");
{
  const w = world();
  for (const [label, pages] of [["absent", undefined], ["empty", []], ["a number", 0], ["a string", "0"],
                                ["an object", { 0: 0 }], ["null", null]]) {
    const r = await w.ask(good({ pages }));
    t(`R4 pages ${label} -> 400 BAD_PAGES`, [r.status, r.body.ok, r.body.reason], [400, false, "BAD_PAGES"]);
  }
  const none = await w.ask(good({ pages: [-1, 1.5, "0", null, NaN, {}] }));
  t("R4 R6 a non-empty array naming no non-negative integer -> 400 BAD_PAGES, the same way",
    [none.status, none.body.ok, none.body.reason], [400, false, "BAD_PAGES"]);
  t("R6 and no page was rendered for it", w.render.calls.length, 0);

  const many = await w.ask(good({ pages: [9, 5, 2, 2, -1, 1.5, "3", 5, 12] }));
  t("R6 exactly ONE page is transcribed: the lowest distinct non-negative integer",
    [many.body.ok, many.body.pages.map((p) => p.page), w.render.calls.map((c) => c.page)], [true, [2], [2]]);
  t("R6 the rest of the distinct integers, ascending, are `deferred` and not attempted", many.body.deferred, [5, 9, 12]);
  t("R6 `notes` says why: one page per invocation, the measured memory bound, whole-document unmeasured",
    [many.body.notes.some((n) => /ONE PAGE PER INVOCATION/.test(n) && /61\.3 MB/.test(n) && /75\.7 MB frame is killed/.test(n)
                                && /UNMEASURED/.test(n) && /\(5, 9, 12\)/.test(n))], [true]);
  const one = await w.ask(good({ pages: [4, 4] }));
  t("R6 nothing deferred -> `deferred` is empty and no deferral note is written",
    [one.body.deferred, one.body.notes.some((n) => /ONE PAGE PER INVOCATION/.test(n))], [[], false]);

  const wr = world({ render: stubRender({ ok: false, reason: "NO_SUCH_PAGE", pageCount: 1 }) });
  const refused = await wr.ask(good({ pages: [7, 3] }));
  t("R6 a refused page still names what it deferred, with the note",
    [refused.body.ok, refused.body.page, refused.body.deferred, refused.body.notes.some((n) => /ONE PAGE PER INVOCATION/.test(n))],
    [false, 3, [7], true]);
}

console.log("\n--- A4 · R5: the binding, the key, and a capture genuinely absent ---");
{
  const w = world();
  let bodyRead = false;
  const req = { method: "POST", url: "http://ocr-worker/transcribe", json: async () => { bodyRead = true; return good(); } };
  for (const [label, env] of [["no CAPTURES", {}], ["CAPTURES without get", { CAPTURES: {} }],
                              ["CAPTURES.get not a function", { CAPTURES: { get: "yes" } }], ["no env at all", undefined]]) {
    const r = await w.member.fetch(req, env);
    const body = await r.json(); WIRE.push(body);
    t(`R5 ${label} -> 503 R2_NOT_CONFIGURED`, [r.status, body.ok, body.reason], [503, false, "R2_NOT_CONFIGURED"]);
  }
  t("R5 and the body was never read", bodyRead, false);
  const bareBad = await w.member.fetch(new Request("http://ocr-worker/", { method: "POST", body: "{" }), {});
  t("R5 checked before the body even on a body that would not parse", bareBad.status, 503);

  const missing = "0".repeat(64);
  const absent = await w.ask(good({ capture_sha: missing }));
  t("R5 a capture not in the store -> 404 NOT_FOUND naming capture_sha and store",
    [absent.status, absent.body.ok, absent.body.reason, absent.body.capture_sha, absent.body.store],
    [404, false, "NOT_FOUND", missing, "scratch"]);
  t("R5 the bytes are read at `${store}/captures/${sha}`",
    w.bucket.log.filter(([k]) => k === "get").map(([, key]) => key), [`scratch/captures/${missing}`]);
  const bio = await w.ask(good({ store: "bio" }));
  t("R5 in either namespace", [bio.status, w.bucket.log.filter(([k]) => k === "get").pop()[1]],
    [200, `bio/captures/${DOC_SHA}`]);
}

console.log("\n--- A5 · R7: the page's refusals, in their order, every one 200 ok:false ---");
{
  /* 1 · ENGINE_ABSENT, before any bytes are touched: the renderer is never called. */
  const w1 = world({ engine: stubEngine({ check: "the wasm core did not arrive" }),
                     render: stubRender({ ok: false, reason: "NOT_A_PDF" }) });
  const r1 = await w1.ask(good());
  t("R7.1 ENGINE_ABSENT is answered 200 ok:false, with the engine's reason",
    [r1.status, r1.body.ok, r1.body.reason, r1.body.refusal.why], [200, false, "ENGINE_ABSENT", "the wasm core did not arrive"]);
  t("R7.1 checked before any bytes are touched: the page was never rendered", w1.render.calls.length, 0);

  /* 2 · PAGE_NOT_RENDERABLE forwards the renderer's own reason, whatever it is. */
  for (const reason of ["PAGE_HAS_TEXT_LAYER", "MULTIPLE_IMAGES_ON_PAGE", "UNSUPPORTED_FILTER", "A_REASON_NOBODY_DECLARED"]) {
    const w = world({ render: stubRender({ ok: false, reason, imageCount: 3 }) });
    const r = await w.ask(good());
    t(`R7.2 the renderer's ${reason} -> 200 PAGE_NOT_RENDERABLE carrying that reason verbatim`,
      [r.status, r.body.ok, r.body.reason, r.body.refusal.render.reason, r.body.refusal.render.detail.imageCount],
      [200, false, "PAGE_NOT_RENDERABLE", reason, 3]);
    t(`R7.2 the member asked the renderer to decode DCT (${reason})`, w.render.calls[0].opts, { decodeDct: true });
  }
  const wNull = world({ render: stubRender(null) });
  const rNull = await wNull.ask(good());
  t("R7.2 a renderer answering nothing is PAGE_NOT_RENDERABLE too", [rNull.body.reason, rNull.body.refusal.render], ["PAGE_NOT_RENDERABLE", null]);

  /* 3 · a container that is not PNG — even at a size over the bound: the container is judged first. */
  const w3 = world({ render: stubRender(pngPage(new Uint8Array([0xff, 0xd8, 0xff]), 5000, 5000,
                                                 { mediaType: "image/jpeg", route: "passthrough-dct" })) });
  const r3 = await w3.ask(good());
  t("R7.3 a container other than image/png -> 200 PIXELS_UNREADABLE, even when its frame is over the bound",
    [r3.status, r3.body.ok, r3.body.reason, r3.body.refusal.mediaType], [200, false, "PIXELS_UNREADABLE", "image/jpeg"]);
  t("R7.3 and the engine never ran", w3.engine.calls.length, 0);

  /* 4 · the frame bound, checked once the container passed and before the PNG is read. 5000 x 3065 x 4 is the
     bound exactly; one more row is over it. The bytes are NOT a PNG, so an over-bound page that reached the reader
     would say PIXELS_UNREADABLE instead. */
  t("R7.4 the bound is the largest frame CPDF-15 measured completing", MAX_FRAME_BYTES, 61_300_000);
  const w4 = world({ render: stubRender(pngPage(new Uint8Array([1, 2, 3]), 5000, 3066)) });
  const r4 = await w4.ask(good());
  t("R7.4 a frame one row over the bound -> 200 FRAME_OVER_MEASURED_BOUND, before its (unreadable) PNG is read",
    [r4.status, r4.body.ok, r4.body.reason], [200, false, "FRAME_OVER_MEASURED_BOUND"]);
  t("R7.4 the refusal names width, height, frame_bytes and bound_bytes",
    [r4.body.refusal.width, r4.body.refusal.height, r4.body.refusal.frame_bytes, r4.body.refusal.bound_bytes],
    [5000, 3066, 5000 * 3066 * 4, 61_300_000]);
  t("R7.4 and states a workload size, never a share of 128 MB",
    [/NOT a share of any ceiling/.test(r4.body.refusal.why), /128/.test(r4.body.refusal.why)], [true, false]);
  const w4b = world({ render: stubRender(pngPage(new Uint8Array([1, 2, 3]), 5000, 3065)) });
  const r4b = await w4b.ask(good());
  t("R7.4 a frame EXACTLY at the bound is not refused by it (it reaches the PNG reader, step 5)",
    r4b.body.reason, "PIXELS_UNREADABLE");

  /* 5 · a PNG the member's reader refuses, every shape. */
  const bad = [
    ["not a PNG at all", new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), "NOT_A_PNG"],
    ["interlaced", png({ width: 4, height: 3, interlace: 1, rows: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] }), "PNG_INTERLACED"],
    ["RGBA (colour type 6)", png({ width: 1, height: 1, colorType: 6, rows: [[1, 2, 3, 4]] }), "PNG_UNSUPPORTED_SHAPE"],
    ["16-bit grey", png({ width: 1, height: 1, bitDepth: 16, rows: [[1, 2]] }), "PNG_UNSUPPORTED_SHAPE"],
    ["1-bit RGB", png({ width: 8, height: 1, bitDepth: 1, colorType: 2, rows: [[0]] }), "PNG_UNSUPPORTED_SHAPE"],
    ["a scanline filter other than 0", png({ width: 4, height: 3, filter: 1, rows: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] }), "PNG_FILTER_UNSUPPORTED"],
    ["a truncated chunk", png({ width: 4, height: 3, rows: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], truncate: true }), "PNG_TRUNCATED"],
    ["no IHDR", png({ width: 4, height: 3, ihdr: false, rows: [[0, 0, 0, 0]] }), "PNG_NO_IHDR"],
    ["no IDAT", png({ width: 4, height: 3, idat: false, rows: [] }), "PNG_NO_IDAT"],
    ["a raster shorter than its header", png({ width: 4, height: 3, rows: [[0, 0, 0, 0]] }), "PNG_SHORT_RASTER"],
  ];
  for (const [label, bytes, why] of bad) {
    const w = world({ render: stubRender(pngPage(bytes, 4, 3)) });
    const r = await w.ask(good());
    t(`R7.5 a PNG that is ${label} -> 200 PIXELS_UNREADABLE (${why}), and the engine never ran`,
      [r.status, r.body.ok, r.body.reason, r.body.refusal.png?.reason, w.engine.calls.length],
      [200, false, "PIXELS_UNREADABLE", why, 0]);
  }

  /* 6 · the engine refused, or threw. */
  const w6 = world({ engine: stubEngine({ frame: () => ({ ok: false, error: "loadImage refused", name: "RangeError" }) }) });
  const r6 = await w6.ask(good());
  t("R7.6 the engine refused -> 200 ENGINE_FAILED with its own error name and message",
    [r6.status, r6.body.ok, r6.body.reason, r6.body.refusal.engine_error_name, r6.body.refusal.engine_error],
    [200, false, "ENGINE_FAILED", "RangeError", "loadImage refused"]);
  const w6b = world({ engine: stubEngine({ frame: () => { throw new TypeError("wasm trap"); } }) });
  const r6b = await w6b.ask(good());
  t("R7.6 the engine threw -> the same 200 ENGINE_FAILED, never a 500",
    [r6b.status, r6b.body.reason, r6b.body.refusal.engine_error_name, r6b.body.refusal.engine_error],
    [200, "ENGINE_FAILED", "TypeError", "wasm trap"]);

  /* 7 · nothing anchorable came back. */
  const w7 = world({ engine: stubEngine({ regions: [{ text: "", rect: [0, 0, 1, 1], confidence: 0.9 },
                                                    { text: "  \n", rect: [0, 0, 1, 1] },
                                                    { text: "word", rect: [0, 0, NaN, 1] }] }) });
  const r7 = await w7.ask(good());
  t("R7.7 no region with both text and a finite rectangle -> 200 NOTHING_TRANSCRIBED, naming the boxes",
    [r7.status, r7.body.ok, r7.body.reason, r7.body.refusal.boxes, r7.body.refusal.blank, r7.body.refusal.unanchored],
    [200, false, "NOTHING_TRANSCRIBED", 3, 2, 1]);
  const w7b = world({ engine: stubEngine({ regions: [] }) });
  const r7b = await w7b.ask(good());
  t("R7.7 an engine that boxed nothing at all is the same finding", [r7b.status, r7b.body.reason, r7b.body.refusal.boxes],
    [200, "NOTHING_TRANSCRIBED", 0]);
  t("R7 every refusal reason this member emits is declared in its refusal table",
    ["ENGINE_ABSENT", "PAGE_NOT_RENDERABLE", "PIXELS_UNREADABLE", "FRAME_OVER_MEASURED_BOUND", "ENGINE_FAILED",
     "NOTHING_TRANSCRIBED", "BAD_SHA", "BAD_STORE", "NAMESPACE_UNKNOWN", "BAD_PAGES", "NOT_FOUND", "R2_NOT_CONFIGURED"]
      .filter((k) => !(k in REFUSALS)), []);
}

console.log("\n--- A6 · R8, R9, R10, R17, R18: the successful answer, its regions, and what is dropped ---");
{
  const regions = [
    { text: "  lowest respon-", rect: [10, 20, 300, 40], confidence: 0.91 },
    { text: "sible\tbidder  ", rect: [10.5, 41, 280.25, 60], confidence: 0 },
    { text: "teh $50,000", rect: [1, 2, 3, 4], confidence: 1 },
    { text: "unrated", rect: [0, 0, 1, 1], confidence: null },
    { text: "over", rect: [0, 0, 1, 1], confidence: 1.01 },
    { text: "under", rect: [0, 0, 1, 1], confidence: -0.01 },
    { text: "nan", rect: [0, 0, 1, 1], confidence: NaN },
    { text: "string", rect: [0, 0, 1, 1], confidence: "0.9" },
    { text: "object", rect: [0, 0, 1, 1], confidence: { value: 0.9, basis: "self_reported" } },
    { text: "", rect: [0, 0, 1, 1], confidence: 0.9 },
    { text: "   ", rect: [0, 0, 1, 1] },
    { text: null, rect: [0, 0, 1, 1] },
    { text: "no rect" },
    { text: "short rect", rect: [0, 0, 1] },
    { text: "infinite", rect: [0, 0, Infinity, 1] },
    { text: "string coord", rect: [0, 0, "1", 1] },
    { text: "rect a string", rect: "0,0,1,1" },
  ];
  const w = world({ engine: stubEngine({ regions }), render: stubRender((page) => pngPage(GREY4x3, 4, 3, { rotate_deg: 90, page })) });
  const { status, body } = await w.ask(good({ pages: [6, 8] }));
  t("R8 a successful answer is 200 ok:true", [status, body.ok], [200, true]);
  t("R8 it carries exactly the named fields",
    keys(body), ["cap", "confidence_floor", "deferred", "engine", "grain", "image", "measured_by", "model", "notes", "ok", "pages", "version"]);
  t("R8 engine, version, model name the engine", [body.engine, body.version, body.model],
    ["tesseract-wasm", "0.11.0", "tessdata_fast/eng"]);
  t("R8 cap is the fixed letter C", body.cap, "C");
  /* PINNED BYTE FOR BYTE (the requirement's Suggestion): a rewritten measurement citation is a change, caught. */
  t("R8 measured_by is the one measurement's citation, byte for byte",
    body.measured_by,
    "MEASUREMENTS.md 2026-09-10 (CPDF-15) — tesseract-wasm@0.11.0 SIMD + tessdata_fast eng on the "
    + "deployed Workers runtime: 99.89% characters and 89/90 digits with ZERO minted on the one "
    + "human-ground-truthed page (Oakland Legistar attachment 15721260 p2, 300 dpi), reproducible "
    + "over identical bytes (9 images x 3 runs, no image gave more than one distinct text), the "
    + "invention band EMPTY at every rung of CPDF-11's ladder. REACH, STATED: ONE ground-truthed "
    + "page, ONE engine version, ONE model. Every other corpus figure in that row is "
    + "agreement-with-the-local-floor and NOT accuracy — and D-314/CPDF-16 measured that NEITHER "
    + "local model passes the noise control, so no agreement figure may be read as accuracy at all.");
  t("R8 grain is line; deferred as R6; notes an array", [body.grain, body.deferred, Array.isArray(body.notes)], ["line", [8], true]);
  t("R8 image carries exactly the rendered frame's facts",
    body.image, { width: 4, height: 3, frame_bytes: 48, route: "stub-route", upright: true, rotate_deg: 90, dpi: 300,
                  pixels_sha256: "f".repeat(64) });
  t("R8 pages is exactly one {page, regions}", [body.pages.length, keys(body.pages[0]), body.pages[0].page],
    [1, ["page", "regions"], 6]);
  t("R8 the engine was given the RGBA frame of the page, width*height*4",
    [w.engine.calls[0].width, w.engine.calls[0].height, w.engine.calls[0].length], [4, 3, 48]);
  t("R8 and that frame is the PNG's samples, grey spread to RGB, opaque",
    w.engine.calls[0].rgba.slice(0, 16), [0, 0, 0, 255, 64, 64, 64, 255, 128, 128, 128, 255, 255, 255, 255, 255]);

  const got = body.pages[0].regions;
  t("R10 regions with blank text or no four finite numbers are dropped: only the anchorable nine remain",
    got.map((r) => r.text), ["  lowest respon-", "sible\tbidder  ", "teh $50,000", "unrated", "over", "under", "nan", "string", "object"]);
  t("R10 the dropped are COUNTED on the wire, never kept as text with no anchor",
    body.notes.some((n) => /^5 region\(s\) the engine returned carried no usable rectangle/.test(n)), true);
  t("R18 the text is exactly what the decoder decoded: no joining, no trimming, no correction",
    got.slice(0, 3).map((r) => r.text), ["  lowest respon-", "sible\tbidder  ", "teh $50,000"]);
  t("R9 every region carries exactly text, source, confidence", [...new Set(got.map((r) => keys(r).join()))],
    ["confidence,source,text"]);
  t("R9 the source is a pdf-page anchor in image pixels, with the image it indexes",
    got[1].source, { kind: "pdf-page", ref: "p6", page: 6, rect: [10.5, 41, 280.25, 60], space: "image-px",
                     image: { width: 4, height: 3, route: "stub-route", upright: true, rotate_deg: 90,
                              pixels_sha256: "f".repeat(64) } });
  t("R9 the PLANE's own anchor check accepts every region", got.filter((r) => checkAnchor(r.source) != null).length, 0);
  t("R9 R17 an engine-rated value in 0..1 is carried unchanged, basis engine",
    got.slice(0, 3).map((r) => r.confidence), [{ value: 0.91, basis: "engine" }, { value: 0, basis: "engine" },
                                               { value: 1, basis: "engine" }]);
  t("R9 R17 anything else is the stated string none — never substituted, rescaled or invented",
    got.slice(3).map((r) => r.confidence), ["none", "none", "none", "none", "none", "none"]);
  t("R17 the only bases on the wire are engine and none",
    [...new Set(got.map((r) => (r.confidence === "none" ? "none" : r.confidence.basis)))].sort(), ["engine", "none"]);
  t("R9 R17 the PLANE's own confidence check accepts every region", got.filter((r) => checkConfidence(r.confidence) != null).length, 0);
  t("R17 the unrated are counted on the wire",
    body.notes.some((n) => /^6 region\(s\) came back with no engine-computed confidence/.test(n)), true);

  const clean = world();
  const c = await clean.ask(good());
  t("R8 notes is empty when there is nothing to say", c.body.notes, []);
  const rgb = world({ render: stubRender(pngPage(RGB2x2, 2, 2)) });
  await rgb.ask(good());
  t("R8 an RGB page reaches the engine as its own RGBA", rgb.engine.calls[0].rgba.slice(0, 16),
    [1, 2, 3, 255, 4, 5, 6, 255, 7, 8, 9, 255, 10, 11, 12, 255]);
  const bil = world({ render: stubRender(pngPage(BILEVEL9x2, 9, 2)) });
  await bil.ask(good());
  t("R8 a bilevel page reaches the engine as white (1) and black (0), padding bits unread",
    bil.engine.calls[0].rgba.filter((_, i) => i % 4 === 0).slice(0, 18), [255, 0, 255, 255, 0, 0, 0, 0, 255,
                                                                          255, 255, 255, 255, 255, 255, 255, 255, 0]);
}

console.log("\n--- A7 · R8: the confidence floor is the instance's, or a stated null ---");
{
  for (const [raw, want] of [[undefined, null], ["", null], ["0.5", 0.5], ["0", 0], ["1", 1], [0.25, 0.25],
                             ["1.5", null], ["-0.1", null], ["abc", null], ["NaN", null], [null, null]]) {
    const w = world({ env: { OCR_CONFIDENCE_FLOOR: raw } });
    const r = await w.ask(good());
    t(`R8 OCR_CONFIDENCE_FLOOR ${JSON.stringify(raw)} -> confidence_floor ${JSON.stringify(want)}`, r.body.confidence_floor, want);
  }
  const w = world({ env: { OCR_CONFIDENCE_FLOOR: "0.99" } });
  const r = await w.ask(good());
  t("R8 the member states the floor and never applies it: a region under it is still on the wire",
    [r.body.confidence_floor, r.body.pages[0].regions.map((x) => x.confidence.value)], [0.99, [0.5]]);
  const p = world({ env: { OCR_PSM: "6" } });
  await p.ask(good());
  t("R21 the instance's OCR_PSM is threaded to the engine as its segmentation mode", p.engine.calls[0].opts, { psm: "6" });
}

console.log("\n--- A8 · R11, R12, R13, R14: /version and every other route ---");
{
  const get = async (member, env, path, method = "GET") => {
    const r = await member.fetch(new Request(`http://ocr-worker${path}`, { method }), env);
    const body = await r.json(); WIRE.push(body); return { status: r.status, body };
  };
  const loaded = makeMember(stubEngine());
  const v = await get(loaded, { VERSION: "build-7" }, "/version");
  t("R11 R12 R13 GET /version answers exactly the named fields",
    [v.status, v.body], [200, { ok: true, name: "ocr-worker", version: "build-7", engine: "tesseract-wasm",
                                engine_version: "0.11.0", model: "tessdata_fast/eng", engine_loaded: true }]);
  t("R11 the version is the running build's env.VERSION, whatever it is",
    (await get(loaded, { VERSION: "another-build" }, "/version")).body.version, "another-build");
  const e = stubEngine({ check: "the language model is 12 B" });
  const broken = await get(makeMember(e), { VERSION: "b" }, "/version");
  t("R13 engine_loaded is asked: false, with engine_unavailable naming why",
    [broken.body.engine_loaded, broken.body.engine_unavailable, e.checks], [false, "the language model is 12 B", 1]);
  t("R13 a member without its engine answers every other route normally",
    (await post(makeMember(e), { CAPTURES: recordingBucket().proxy }, good({ capture_sha: "x" }))).body.reason, "BAD_SHA");
  for (const [method, path] of [["GET", "/transcribe"], ["POST", "/version"], ["PUT", "/transcribe"], ["GET", "/"],
                                ["DELETE", "/transcribe"], ["GET", "/other"], ["POST", "/transcribe/more"],
                                ["POST", "/Transcribe"], ["PATCH", "/"]]) {
    const r = await get(loaded, { CAPTURES: recordingBucket().proxy }, path, method);
    t(`R14 ${method} ${path} -> 404 UNKNOWN`, [r.status, r.body.ok, r.body.reason], [404, false, "UNKNOWN"]);
  }
  const w = world();
  const bare = await w.ask(good(), "/");
  t("R14 POST at the bare path IS transcribe, not unknown", [bare.status, bare.body.ok], [200, true]);
}

console.log("\n--- A9 · R15, R21: what the member touched — only CAPTURES.get, no network, no state ---");
{
  const w = world({ engine: stubEngine({ regions: [{ text: "x", rect: [0, 0, 1, 1], confidence: 0.3 }] }) });
  const a1 = await w.ask(good({ pages: [0, 3] }));
  const b = await w.ask(good({ capture_sha: "0".repeat(64) }));
  const a2 = await w.ask(good({ pages: [0, 3] }));
  t("R21 the same request answers the same bytes, whatever was asked in between", JSON.stringify(a2.body), JSON.stringify(a1.body));
  t("R21 R15 the only thing touched on CAPTURES was `get`", [...new Set(w.bucket.log.filter(([k]) => k === "touch").map(([, p]) => p))], ["get"]);
  t("R21 no network call was made by the member in all of Part A", netCalls, []);
  t("R15 and the stand-in bucket's contents are unchanged", [...w.bucket.objects.keys()].length, 2);
  void b;
}

/* ============================================================================================================ *
 * Part B — the COMMITTED BUNDLE under workerd, the real engine, the real renderer
 * ============================================================================================================ */
globalThis.fetch = realFetch;

const baseDef = ocrWorkerDef({ bindings: { VERSION: "member-suite" } });
const partsWith = (def, name, replace) => ({ ...def, name, modules: def.modules.map((m) => replace(m) || m) });
const mf = new Miniflare({ workers: [
  baseDef,
  { ...ocrWorkerDef({ name: "ocr-floor", bindings: { VERSION: "member-suite", OCR_CONFIDENCE_FLOOR: "0.5", OCR_PSM: "3" } }) },
  /* A wrong language model: the first 4096 bytes of the real one. */
  partsWith(ocrWorkerDef({ bindings: { VERSION: "member-suite" } }), "ocr-wrong-model",
    (m) => (m.path === MODEL ? { ...m, contents: readFileSync(MODEL).subarray(0, 4096) } : null)),
  /* The wasm core uploaded as plain data rather than compiled at upload. */
  partsWith(ocrWorkerDef({ bindings: { VERSION: "member-suite" } }), "ocr-wasm-as-data",
    (m) => (m.path === WASM ? { ...m, type: "Data" } : null)),
] });
const bucket = await mf.getR2Bucket("CAPTURES");
const STORE = "scratch";
const puts = [["scan", SCAN], ["blank", BLANK], ["noise", NOISE], ["huge", HUGE], ["texty", TEXTY], ["notpdf", NOT_PDF]];
const shaOf = new Map();
for (const [name, bytes] of puts) { shaOf.set(name, hex(bytes)); await bucket.put(`${STORE}/captures/${hex(bytes)}`, bytes); }
await bucket.put(`bio/captures/${SCAN_SHA}`, SCAN);
await bucket.put(`biosmoke/captures/${SCAN_SHA}`, SCAN);

async function snapshot() {
  const out = [];
  let cursor;
  do {
    const page = await bucket.list({ cursor });
    for (const o of page.objects) out.push([o.key, hex(Buffer.from(await (await bucket.get(o.key)).arrayBuffer()))]);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return out.sort((a, b) => a[0].localeCompare(b[0]));
}
const BEFORE = await snapshot();

const workerCall = async (worker, path, init) => {
  const w = await mf.getWorker(worker);
  const r = await w.fetch(`http://ocr-worker${path}`, init);
  const body = await r.json(); WIRE.push(body); return { status: r.status, body };
};
const call = (body, worker = "ocr-worker") => workerCall(worker, "/transcribe", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const ask = (name, pages = [0], worker) => call({ capture_sha: shaOf.get(name), store: STORE, pages }, worker);

console.log("\n--- B1 · R11, R12, R13, R19: the committed bundle boots, and the engine is really in it ---");
{
  const v = await workerCall("ocr-worker", "/version");
  t("R11 R12 R13 GET /version, from the committed bundle", [v.status, v.body],
    [200, { ok: true, name: "ocr-worker", version: "member-suite", engine: "tesseract-wasm", engine_version: "0.11.0",
            model: "tessdata_fast/eng", engine_loaded: true }]);
  const wm = await workerCall("ocr-wrong-model", "/version");
  t("R13 R19 a different language model: engine_loaded false, and it says the model is not the measured one",
    [wm.body.engine_loaded, /4096 B/.test(wm.body.engine_unavailable), /4113088 B/.test(wm.body.engine_unavailable)],
    [false, true, true]);
  const wd = await workerCall("ocr-wasm-as-data", "/version");
  t("R13 R19 a wasm core that did not arrive compiled: engine_loaded false, and it says so",
    [wd.body.engine_loaded, /did not arrive as a compiled module/.test(wd.body.engine_unavailable)], [false, true]);
  for (const worker of ["ocr-wrong-model", "ocr-wasm-as-data"]) {
    const r = await ask("texty", [0], worker);
    t(`R7.1 R19 ${worker}: every page is refused ENGINE_ABSENT, before its bytes are looked at`,
      [r.status, r.body.ok, r.body.reason], [200, false, "ENGINE_ABSENT"]);
    t(`R13 ${worker}: the other routes answer normally`, (await call({ capture_sha: "x", store: STORE, pages: [0] }, worker)).body.reason,
      "BAD_SHA");
  }
  /* The core's exact bytes cannot be read back from a compiled module; they are pinned before deploy by the
     bundle manifest, which hashes both upload parts (bundler R4, R6). Q1 in the job record. */
  const member = discoverMembers().find((m) => m.name === "ocr-worker");
  const vs = verifyStatic(member);
  t("R19 the committed manifest's input and asset hashes match the tree (a swapped engine is caught as stale)",
    vs.findings, []);
  t("R19 the manifest pins both upload parts at the measured sizes",
    (vs.manifest?.assets || []).map((a) => [a.path, a.bytes]),
    [["assets/tesseract-core.wasm", 1839004], ["assets/eng.traineddata", 4113088]]);
  t("R19 and the committed files are those sizes", [statSync(WASM).size, statSync(MODEL).size], [1839004, 4113088]);
}

console.log("\n--- B2 · R8, R9, R17, R18, R20, R21: THE REAL PAGE, transcribed inside workerd ---");
let real = null;
{
  const { status, body } = await ask("scan");
  real = body;
  t("R8 200 ok:true, with every named field", [status, body.ok, keys(body)],
    [200, true, ["cap", "confidence_floor", "deferred", "engine", "grain", "image", "measured_by", "model", "notes", "ok", "pages", "version"]]);
  t("R8 the engine named; cap C, a letter of the record's scale; measured_by the one citation",
    [body.engine, body.version, body.model, body.cap, BASIS_GRADES.includes(body.cap), body.measured_by === MEASURED_BY],
    ["tesseract-wasm", "0.11.0", "tessdata_fast/eng", "C", true, true]);
  t("R8 the floor is a stated null (none configured); grain line; nothing deferred",
    [body.confidence_floor, body.grain, body.deferred], [null, "line", []]);
  t("R8 the image is the rendered frame's, by the independent decoder's digest",
    body.image, { width: 2550, height: 3300, frame_bytes: 2550 * 3300 * 4, route: "decoded-ccitt-g4", upright: true,
                  rotate_deg: 270, dpi: body.image.dpi, pixels_sha256: IND_UPRIGHT_SHA });
  t("R8 exactly one page, page 0", [body.pages.length, body.pages[0].page], [1, 0]);

  const regions = body.pages[0].regions;
  t("R9 a real page's worth of text came back (floors, not equalities)",
    [regions.length >= 30, regions.reduce((n, r) => n + r.text.length, 0) >= 2000], [true, true]);
  console.log(`        ${regions.length} region(s) · ${regions.reduce((n, r) => n + r.text.length, 0)} character(s)`);
  t("R9 R10 every region: non-blank text, a pdf-page anchor the PLANE accepts, in image pixels, inside the image",
    regions.filter((r) => {
      const s = r.source || {}, rect = Array.isArray(s.rect) ? s.rect : [], im = s.image || {};
      return !(typeof r.text === "string" && r.text.trim() && checkAnchor(s) == null && s.ref === "p0" && s.page === 0
               && s.space === "image-px" && rect.length === 4 && rect[0] >= 0 && rect[1] >= 0 && rect[2] <= im.width
               && rect[3] <= im.height && rect[2] > rect[0] && rect[3] > rect[1]);
    }).length, 0);
  t("R9 every region's image is the frame that was OCR'd",
    [...new Set(regions.map((r) => JSON.stringify(r.source?.image)))],
    [JSON.stringify({ width: 2550, height: 3300, route: "decoded-ccitt-g4", upright: true, rotate_deg: 270,
                      pixels_sha256: IND_UPRIGHT_SHA })]);
  t("R9 R17 every confidence is accepted by the PLANE's checker, and the only basis is the engine's",
    [regions.filter((r) => checkConfidence(r.confidence) != null).length,
     [...new Set(regions.map((r) => (r.confidence === "none" ? "none" : r.confidence.basis)))]], [0, ["engine"]]);
  /* PINS on the known page, not a score: the two strings CPDF-11 measured a generative model minting wrong. */
  const joined = regions.map((r) => r.text).join(" ");
  t("R18 the dollar figure comes back as the page says it, not as the $10,000 a model minted",
    [joined.includes("$50,000"), joined.includes("$10,000")], [true, false]);
  t("R18 and \"lowest responsible\", not the \"least responsible\" a model minted",
    [joined.includes("lowest responsible"), joined.includes("least responsible")], [true, false]);

  const again = await call({ capture_sha: SCAN_SHA, store: "bio", pages: [0] });
  t("R20 R21 the same bytes under the other namespace answer the identical wire answer", JSON.stringify(again.body),
    JSON.stringify(real));
  const floored = await ask("scan", [0], "ocr-floor");
  t("R8 R21 an instance with a floor and a segmentation mode states the floor, and the call goes through",
    [floored.body.ok, floored.body.confidence_floor, floored.body.pages[0].regions.length > 0], [true, 0.5, true]);
}

console.log("\n--- B3 · R6: ONE page per invocation, on the real member ---");
{
  const { body } = await ask("scan", [2, 0, 1, 0]);
  t("R6 asked for three pages, it answers ONE — the lowest — and defers the rest",
    [body.ok, body.pages.map((p) => p.page), body.deferred], [true, [0], [1, 2]]);
  t("R6 the note says why", body.notes.some((n) => /ONE PAGE PER INVOCATION/.test(n) && /UNMEASURED/.test(n)), true);
  const past = await ask("scan", [3, 1, 1]);
  t("R6 R7.2 the lowest is taken even when the document has no such page, and the rest stay deferred",
    [past.body.reason, past.body.page, past.body.deferred, past.body.refusal.render.reason],
    ["PAGE_NOT_RENDERABLE", 1, [3], "NO_SUCH_PAGE"]);
}

console.log("\n--- B4 · R7: the real renderer's refusals pass through verbatim; the real bound; the real controls ---");
{
  for (const [name, page] of [["texty", 0], ["notpdf", 0], ["scan", 5]]) {
    const direct = await renderPageToPixels(name === "texty" ? TEXTY : name === "notpdf" ? NOT_PDF : SCAN, page, { decodeDct: true });
    const r = await ask(name, [page]);
    t(`R7.2 ${name} p${page}: 200 PAGE_NOT_RENDERABLE carrying the renderer's own reason (${direct.reason})`,
      [r.status, r.body.ok, r.body.reason, r.body.refusal.render.reason], [200, false, "PAGE_NOT_RENDERABLE", direct.reason]);
  }
  const huge = await ask("huge");
  t("R7.4 a 5000 x 5000 page is refused FRAME_OVER_MEASURED_BOUND, 200, naming its frame",
    [huge.status, huge.body.ok, huge.body.reason, huge.body.refusal.frame_bytes, huge.body.refusal.bound_bytes],
    [200, false, "FRAME_OVER_MEASURED_BOUND", 100_000_000, 61_300_000]);
  /* THE CONTROL EVERY ENGINE MUST PASS: nothing on a page with nothing on it — a blank, and noise. */
  const blank = await ask("blank");
  const noise = await ask("noise");
  t("R7.7 BLANK: 200 NOTHING_TRANSCRIBED", [blank.status, blank.body.ok, blank.body.reason], [200, false, "NOTHING_TRANSCRIBED"]);
  t("R7.7 NOISE: answered exactly the same way — the engine self-refuses",
    [noise.status, noise.body.ok, noise.body.reason], [200, false, "NOTHING_TRANSCRIBED"]);
  t("R7.7 each names how many boxes it found and how many were blank or unanchored",
    [blank.body.refusal, noise.body.refusal].map((x) => [typeof x.boxes, typeof x.blank, typeof x.unanchored]),
    [["number", "number", "number"], ["number", "number", "number"]]);
}

console.log("\n--- B5 · R1–R5 and R14 on the committed bundle ---");
{
  t("R1 a bad sha", [(await call({ capture_sha: "nope", store: STORE, pages: [0] })).status], [400]);
  t("R2 an absent store", (await call({ capture_sha: SCAN_SHA, pages: [0] })).body.reason, "BAD_STORE");
  const unknown = await call({ capture_sha: SCAN_SHA, store: "biosmoke", pages: [0] });
  t("R3 R16 an unknown namespace, though the page's bytes sit under it",
    [unknown.status, unknown.body.reason, unknown.body.asked, unknown.body.namespaces],
    [400, "NAMESPACE_UNKNOWN", "biosmoke", ["bio", "scratch"]]);
  t("R4 pages naming no page", [(await call({ capture_sha: SCAN_SHA, store: STORE, pages: ["0"] })).status], [400]);
  const missing = await call({ capture_sha: "0".repeat(64), store: STORE, pages: [0] });
  t("R5 a capture that is not there: 404 NOT_FOUND — distinguishable from the 400 NAMESPACE_UNKNOWN",
    [missing.status, missing.body.reason, unknown.status], [404, "NOT_FOUND", 400]);
  const noR2 = new Miniflare({ workers: [ocrWorkerDef({ r2: false })] });
  const r = await noR2.dispatchFetch("http://ocr-worker/transcribe", { method: "POST", body: "{" });
  t("R5 a member with no CAPTURES binding: 503 R2_NOT_CONFIGURED", [r.status, (await r.json()).reason], [503, "R2_NOT_CONFIGURED"]);
  await noR2.dispose();
  t("R14 an unknown route", [(await workerCall("ocr-worker", "/whatever")).status], [404]);
}

console.log("\n--- B6 · R15: it wrote nothing, and cannot ---");
{
  t("R15 the whole bucket, every object, is byte-identical after every call above", await snapshot(), BEFORE);
  t("R15 and that bucket was not empty — an equality over nothing is not evidence", BEFORE.length >= 8, true);

  /* The deployment config is where a binding is granted. */
  const cfg = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8");
  t("R15 the config grants CAPTURES and no other binding: no durable_objects (STORE), no PUBLISHED",
    [[...cfg.matchAll(/"binding":\s*"([A-Z_]+)"/g)].map((m) => m[1]), /durable_objects/.test(cfg), /PUBLISHED/.test(cfg.replace(/\/\/[^\n]*/g, ""))],
    [["CAPTURES"], false, false]);
  /* R15's own clause is about the SOURCES: no write call appears in them. Read with comments removed. */
  const SRC = fileURLToPath(new URL("../src/", import.meta.url));
  const own = readdirSync(SRC).filter((f) => f.endsWith(".mjs") && f !== "tesslib.mjs");
  const code = own.map((f) => readFileSync(SRC + f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1")).join("\n");
  t("R15 the sources read are this member's own (five modules, not an empty corpus)",
    [own.sort(), code.length > 10000], [["contract.mjs", "index.mjs", "member.mjs", "pngsamples.mjs", "tessengine.mjs"], true]);
  t("R15 no .put, .delete, .createMultipartUpload or .resumeMultipartUpload call in them",
    [...code.matchAll(/\.(put|delete|createMultipartUpload|resumeMultipartUpload)\s*\(/g)].map((m) => m[1]), []);
  /* The generated vendor glue is the vendor's code, accounted for rather than waved past: its only write-shaped
     calls are emscripten destructors on the engine's own handles and a JS Set, and it reaches no binding. */
  const glue = readFileSync(SRC + "tesslib.mjs", "utf8");
  t("R15 the vendor glue's only write-shaped calls are an emscripten destructor pair and a JS Set",
    [...glue.matchAll(/([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.delete\s*\(/g)].map((m) => m[1]).sort(),
    ["engineImage", "listeners", "this._engine"]);
  t("R15 and it has no .put and reaches no Workers binding",
    [/\.put\s*\(/.test(glue), /\benv\s*\.\s*(CAPTURES|STORE|PUBLISHED)\b/.test(glue)], [false, false]);
}

console.log("\n--- B7 · R20: no place is named in behaviour ---");
{
  /* The one place-name the member may carry is the citation of the measurement `measured_by` rests on. Every wire
     answer this suite saw, in both parts, is searched with that citation removed — and with the transcribed text
     removed, which is the DOCUMENT's words (the real page is a council resolution), not the member's. */
  const text = WIRE.map((b) => JSON.stringify({ ...b, measured_by: undefined, pages: undefined })).join("\n");
  t("R20 the answers read were many", WIRE.length > 100, true);
  t("R20 no wire answer names a place outside the measurement citation", /oakland|alameda|legistar|california/i.test(text), false);
  t("R20 and the citation is provenance, the same string in every answer",
    [...new Set(WIRE.filter((b) => b.measured_by).map((b) => b.measured_by))], [MEASURED_BY]);
}

footReached = true;
await mf.dispose();
} finally {
  globalThis.fetch = realFetch;
}

console.log(`\nocr-worker: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
