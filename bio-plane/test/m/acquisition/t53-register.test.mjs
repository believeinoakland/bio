/* acquisition T53 (T53-100; N1259, K4403, K1485, K1492): R125 a register piece is fetched, reduced as it arrives and only the reduced copy stored, R126 its input
   bound and its numbered segments, R127 its slices and resume, R128 the probe that fetches no body, R129 an unchanged source not fetched again, R132 only the
   definition's hosts, R133 the capture filed for an import. At the module's interface (`streamRegister`, `probeRegister`, `sourceChanged`), over a scripted
   source that answers HEAD and ranges as a real file host does, with the test profile's register definitions (`jurisdictions`, "test-port-ellery"). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, network, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { streamRegister, probeRegister, sourceChanged, civicsmithUserAgent } from "../../../src/acquisition/index.mjs";
import { createReducer } from "../../../src/register-readers/index.mjs";
import { get } from "../../../../jurisdictions/index.mjs";

const PROFILE = get("test-port-ellery");
const DEF = (key) => structuredClone(PROFILE.registers.find((r) => r.key === key));
const BOUNDS = { stream_max: 5 * 1024 ** 3, segment_max: 64 * 1024 * 1024 };
const SENT = { street: "9000 SENTINEL-STREET", tel: "555-0199-SENTINEL" };
const HOST = "data.marlow-county.example";
const URL_ = `https://${HOST}/files/2025.csv`;

/* the town's comma file: a header row, then rows with the contact columns the definition drops */
const HEADER = "filer,donor_name,donor_org,paid,received,form_no,donor_city,donor_state,donor_zip,donor_street,donor_tel,note";
const rowOf = (i, extra = {}) => [`F${1000 + (i % 7)}`, `Donor ${i}`, i % 3 === 0 ? `Firm ${i}` : "", `${100 + i}.00`, `0${1 + (i % 9)}/15/2025`, `460-${i}`, "Port Ellery", "ME", "04101", SENT.street, SENT.tel, `note ${i}`];
const csv = (n, { header = HEADER, cell = (i) => rowOf(i) } = {}) => `${header}\n${Array.from({ length: n }, (_, i) => cell(i).join(",")).join("\n")}\n`;
const enc = (s) => new TextEncoder().encode(s);

/* a host that serves one file the way file hosts do: HEAD, ranges, validators */
function served(bytes, { etag = '"v1"', modified = "Wed, 01 Oct 2025 00:00:00 GMT", ranges = true, length = true, type = "text/csv", log = null } = {}) {
  return (url, init = {}) => {
    const method = (init.method || "GET").toUpperCase();
    const range = init.headers && (init.headers.range || init.headers.Range);
    if (log) log.push({ url, method, range: range || null });
    const base = { "content-type": type, etag, "last-modified": modified, ...(ranges ? { "accept-ranges": "bytes" } : {}) };
    if (method === "HEAD") return new Response(null, { status: 200, headers: { ...base, ...(length ? { "content-length": String(bytes.length) } : {}) } });
    if (range && ranges) {
      const m = /bytes=(\d+)-(\d+)/.exec(range);
      const a = Number(m[1]), b = Math.min(Number(m[2]), bytes.length - 1);
      return new Response(bytes.slice(a, b + 1), { status: 206, headers: { ...base, "content-range": `bytes ${a}-${b}/${bytes.length}`, "content-length": String(b - a + 1) } });
    }
    return new Response(bytes, { status: 200, headers: { ...base, ...(length ? { "content-length": String(bytes.length) } : {}) } });
  };
}
const hex = async (b) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", b))].map((x) => x.toString(16).padStart(2, "0")).join("");
function setup() {
  const w = world();
  w.core.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  return w;
}
async function call(w, routes, fn) {
  const net = network(routes);
  try { return { out: await fn(w.store), net }; } finally { net.restore(); }
}
const stored = (w) => [...w.b.held.values()].map((v) => new TextDecoder("utf-8", { fatal: false }).decode(v));
const BASE = { piece: "all", holes: { table: "2025" }, import: "imp-1", viewer: "member:m1" };

test("R125: a piece is fetched through the governor under R9's agent, reduced as it arrives, and only the reduced copy is stored: no contact cell is in any object, receipt or document; the original is a fingerprint on the hop", async () => {
  const w = setup();
  const text = csv(30);
  const { out, net } = await call(w, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: BOUNDS }));
  assert.deepEqual([out.ok, out.done, out.segments.length, out.documents.length], [true, true, 1, 1]);
  assert.equal(net.seen.length, 1);
  assert.equal(net.seen[0].init.headers["user-agent"], civicsmithUserAgent("9.9.9", "inst", "register"), "R9's agent naming the purpose");
  assert.ok(w.gov.calls.some((c) => c[0] === "admit" && c[1] === HOST) && w.gov.calls.some((c) => c[0] === "report" && c[1] === HOST), "admitted and reported");
  /* no sentinel anywhere it could be kept */
  const everywhere = JSON.stringify([out, w.prov.receipts]) + stored(w).join("\n");
  assert.ok(!everywhere.includes("SENTINEL"), "no contact cell in any object, receipt, document or answer");
  assert.ok(!stored(w).some((t) => t.includes(HEADER)), "the original is not stored");
  /* the fingerprint of the original is an independent hash; the stored digest is the reducer's own */
  const d = out.documents[0];
  const r = d.capture.reduced;
  assert.equal(r.original.sha256, await hex(enc(text)));
  assert.deepEqual([r.original.bytes, r.original.covers, r.rows_in, r.rows_out], [enc(text).length, "whole_file", 30, 30]);
  assert.deepEqual(r.dropped_columns.map((c) => c.name).sort(), ["donor_street", "donor_tel"]);
  const ref = createReducer({ definition: DEF("town_filings"), piece: "all", filter: {} });
  ref.write(enc(text));
  assert.equal(d.capture.sha256, ref.end().reduced.sha256, "the stored digest equals register-readers' reduced digest");
  assert.ok(w.held(d.capture.sha256));
  /* the first hop says reduction, not "these bytes were served" */
  assert.match(d.provenance_chain[0].asserts, new RegExp(`this file is their reduction`));
  assert.equal(d.provenance_chain[0].via, "direct");
  assert.equal(r.terms_basis, DEF("town_filings").terms_basis);
  assert.equal(w.prov.receipts.length, 1);
  assert.equal(w.prov.receipts[0].via, "direct");
});

test("R125: a gated register, a definition without terms, one that keeps a contact column and a host the definition does not name each fetch nothing and say why", async () => {
  const cases = [
    ["a fee gate", () => ({ definition: DEF("trades_licences"), piece: "all" }), "member_act_required"],
    ["an account gate", () => ({ definition: DEF("company_officers"), piece: "all" }), "member_act_required"],
    ["no terms", () => { const d = DEF("town_filings"); d.terms_basis = ""; return { definition: d, ...BASE }; }, "REGISTER_NO_TERMS"],
    ["a kept phone column", () => { const d = DEF("town_filings"); d.columns.find((c) => c.role === "phone").keep = true; return { definition: d, ...BASE }; }, "REGISTER_KEEPS_CONTACT"],
    ["a people-search gate", () => { const d = DEF("town_filings"); d.gate = "people_search"; return { definition: d, ...BASE }; }, "REGISTER_PEOPLE_SEARCH"],
    ["a host the definition does not name", () => { const d = DEF("town_filings"); d.pieces[0].locator = "https://evil.example/files/{table}.csv"; return { definition: d, ...BASE }; }, "HOST_NOT_IN_DEFINITION"],
    ["an unknown piece", () => ({ definition: DEF("town_filings"), ...BASE, piece: "nope" }), "PIECE_UNKNOWN"],
    ["a hole with no value", () => ({ definition: DEF("town_filings"), ...BASE, holes: {} }), "PIECE_LOCATOR_HOLE"],
  ];
  for (const [what, make, reason] of cases) {
    const w = setup();
    const { out, net } = await call(w, () => new Response(csv(3)), (s) => streamRegister(s, make(), { bounds: BOUNDS }));
    assert.deepEqual([out.ok, out.reason, net.seen.length], [false, reason, 0], what);
    assert.deepEqual([w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0], `${what}: nothing stored`);
  }
});

test("R125 control: a source refusal and an empty body are R10's refusals and file nothing", async () => {
  const w = setup();
  const gone = await call(w, { [URL_]: () => new Response("no", { status: 404 }) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: BOUNDS }));
  assert.deepEqual([gone.out.ok, gone.out.reason, gone.out.status], [false, "SOURCE_REFUSED", 404]);
  const empty = await call(w, { [URL_]: () => new Response("", { status: 200 }) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: BOUNDS }));
  assert.equal(empty.out.ok, false);
  assert.equal(w.prov.receipts.length, 0);
});

/* ---------------- R126 ---------------- */
test("R126: a piece over the stream bound is refused with its size and the bound and nothing is stored; under a larger bound it is read; with no recorded bound nothing is fetched", async () => {
  const body = enc(csv(5));
  const lie = (n) => (url, init) => { const r = served(body)(url, init); return new Response(r.body, { status: r.status, headers: { ...Object.fromEntries(r.headers), "content-length": String(n) } }); };
  const GIB = 1024 ** 3;
  const w = setup();
  const over = await call(w, { [URL_]: lie(6 * GIB) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: { stream_max: 5 * GIB, segment_max: 64 * 1024 * 1024 } }));
  assert.deepEqual([over.out.ok, over.out.reason, over.out.status, over.out.size, over.out.bound, over.out.key], [false, "TOO_LARGE", 413, 6 * GIB, 5 * GIB, "register.stream_max"]);
  assert.deepEqual([w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0]);
  const under = await call(setup(), { [URL_]: lie(6 * GIB) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: { stream_max: 8 * GIB, segment_max: 64 * 1024 * 1024 } }));
  assert.equal(under.out.ok, true, "under 8 GiB it is read");
  /* a body that runs past the bound while it streams (no length declared) is stopped */
  const long = enc(csv(400));
  const run = await call(setup(), { [URL_]: served(long, { length: false }) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: { stream_max: 4000, segment_max: 64 * 1024 * 1024 } }));
  assert.deepEqual([run.out.ok, run.out.reason, run.out.bound], [false, "TOO_LARGE", 4000]);
  /* until the rows exist the bound is not recorded: nothing is fetched */
  const none = await call(setup(), { [URL_]: served(body) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }));
  assert.deepEqual([none.out.reason, none.net.seen.length], ["REGISTER_LIMITS_NOT_RECORDED", 0]);
});

test("R126: the reduced output is cut at row boundaries into numbered segments of at most the segment bound, each its own capture with its header, the last marked final; a piece with no matching row stores one capture with the header and the original's fingerprint", async () => {
  const w = setup();
  const text = csv(60, { cell: (i) => rowOf(i, {}).map((c, k) => (k === 11 ? `a note, with a comma and a ""quote"" and a\nline break ${i}`.replace(/"/g, '""') : c)).map((c, k) => (k === 11 ? `"${c}"` : c)) });
  const SEG = 1500;
  const { out } = await call(w, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: { stream_max: BOUNDS.stream_max, segment_max: SEG } }));
  assert.equal(out.ok, true);
  assert.ok(out.segments.length >= 3, `several segments (${out.segments.length})`);
  assert.deepEqual(out.segments.map((x) => x.n), out.segments.map((_, i) => i));
  assert.deepEqual(out.segments.map((x) => x.final), out.segments.map((_, i) => i === out.segments.length - 1));
  const texts = out.segments.map((x) => new TextDecoder().decode(w.bytesOf(x.sha256)));
  const header = texts[0].slice(0, texts[0].indexOf("\n") + 1);
  for (const t of texts) {
    assert.ok(t.startsWith(header), "each segment is a file with its header");
    assert.ok(enc(t).length <= SEG, "no segment passes the bound");
    assert.ok(t.endsWith("\n"), "cut at a row boundary");
  }
  /* a quoted line break is never a row's end: the rows of all segments are the 60 rows, in order, none split */
  const srcRows = texts.flatMap((t) => [...t.matchAll(/(?:^|\n)(\d+),F\d+,/g)].map((m) => Number(m[1])));
  assert.deepEqual(srcRows, Array.from({ length: 60 }, (_, i) => i + 1), "src_row runs 1..60 across the segments, each once");
  assert.equal(out.documents.length, out.segments.length);
  assert.deepEqual(out.documents.map((d) => [d.origin.segment, d.origin.final]), out.segments.map((x) => [x.n, x.final]));
  for (const d of out.documents) assert.equal(d.capture.reduced.original.sha256, await hex(enc(text)), "every segment names the original's fingerprint");
  /* no matching row: one capture, the header and the original's fingerprint */
  const none = await call(setup(), { [URL_]: served(enc(csv(10))) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), filter: { organizations: ["No Such Firm"] } }, { bounds: BOUNDS }));
  assert.deepEqual([none.out.ok, none.out.segments.length, none.out.segments[0].rows, none.out.documents.length], [true, 1, 0, 1]);
  assert.equal(none.out.documents[0].capture.reduced.original.sha256, await hex(enc(csv(10))));
  /* control: the same piece in one segment when the bound is large */
  const one = await call(setup(), { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: BOUNDS }));
  assert.equal(one.out.segments.length, 1);
});

/* ---------------- R127 ---------------- */
test("R127: a run in slices that stops at a segment boundary and resumes gives the segment digests, counts and original fingerprint of an uninterrupted run; a restart repeats at most the reading, never the storing", async () => {
  const text = csv(80);
  const bounds = { stream_max: BOUNDS.stream_max, segment_max: 1400 };
  const whole = await call(setup(), { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds }));
  assert.equal(whole.out.done, true);
  assert.equal(whole.out.resume, undefined, "an uninterrupted run answers no resume");
  const N = whole.out.segments.length;
  assert.ok(N >= 5);
  /* sliced: a budget of one byte stops after each new segment; after each of the first 5 slices the call is made again from the token alone (a restart: no state is kept) */
  const w = setup();
  let token = null, slices = 0, last = null;
  const putsBySha = new Map();
  for (;;) {
    const r = await call(w, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), resume: token, budget_bytes: 1 }, { bounds }));
    slices++;
    assert.equal(r.out.ok, true, JSON.stringify(r.out));
    if (r.out.done) { last = r.out; break; }
    assert.equal(r.out.checkpoint, "member_start");
    assert.ok(r.out.progress.segments_stored >= slices, "each slice stores at least one new segment");
    token = r.out.resume;
    assert.equal(typeof token, "string");
    assert.ok(slices < 100);
  }
  assert.equal(slices, N, "one segment a slice");
  assert.deepEqual(last.segments.map((x) => [x.n, x.sha256, x.bytes, x.rows, x.final]), whole.out.segments.map((x) => [x.n, x.sha256, x.bytes, x.rows, x.final]));
  assert.equal(last.original.sha256, whole.out.original.sha256);
  assert.deepEqual([last.reduced.rows_in, last.reduced.rows_out], [whole.out.reduced.rows_in, whole.out.reduced.rows_out]);
  /* each segment's object was written once: the puts by digest */
  for (const c of w.b.calls.filter((x) => x[0] === "put")) putsBySha.set(c[1], (putsBySha.get(c[1]) || 0) + 1);
  assert.ok([...putsBySha.values()].every((n) => n === 1), "no object was stored twice");
  /* two calls from one token store each segment once and the second answers existed */
  const w2 = setup();
  const a = await call(w2, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), budget_bytes: 1 }, { bounds }));
  const b1 = await call(w2, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), resume: a.out.resume }, { bounds }));
  const b2 = await call(w2, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), resume: a.out.resume }, { bounds }));
  assert.deepEqual(b1.out.segments.map((x) => x.sha256), b2.out.segments.map((x) => x.sha256));
  const puts = new Map();
  for (const c of w2.b.calls.filter((x) => x[0] === "put")) puts.set(c[1], (puts.get(c[1]) || 0) + 1);
  assert.ok([...puts.values()].every((n) => n === 1), "stored once");
  assert.equal(b2.out.segments.filter((x) => x.existed).length, b2.out.segments.length, "the second answers existed");
  /* a token of another piece, a source that changed under it, and a damaged token are refused */
  assert.equal((await call(setup(), { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), import: "other", resume: a.out.resume }, { bounds }))).out.reason, "RESUME_MISMATCH");
  assert.equal((await call(setup(), { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), resume: "!!" }, { bounds }))).out.reason, "RESUME_MISMATCH");
  const changed = enc(text.replace("Donor 3,", "Donor X,"));
  assert.equal((await call(setup(), { [URL_]: served(changed) }, (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings"), resume: a.out.resume }, { bounds }))).out.reason, "RESUME_DIVERGED");
});

test("R127 R126: a deflate member of a zip is read by range, restarts from its member's start (`member_start`), and its covers states the member", async () => {
  const D = DEF("county_raw");
  const tsv = (n) => `FILING\tPAYER\tSUM\tWHEN\tREFNO\tSTREET\n${Array.from({ length: n }, (_, i) => `C${i % 5}\tPayer ${i}\t${10 + i}\t2025-01-0${1 + (i % 9)}\tR${i}\t${SENT.street}`).join("\n")}\n`;
  const zip = makeZip([{ name: "RECEIPTS.TSV", data: tsv(120) }, { name: "SPENDING.TSV", data: tsv(5) }]);
  const URLZ = "https://files.marlow-county.example/raw.zip";
  const w = setup();
  const log = [];
  const { out } = await call(w, { [URLZ]: served(zip, { type: "application/zip", log }) }, (s) => streamRegister(s, { definition: D, piece: "receipts", import: "imp-z", viewer: "member:m1" }, { bounds: BOUNDS }));
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(out.checkpoint, "member_start");
  assert.equal(out.documents[0].capture.reduced.original.covers, "member:RECEIPTS.TSV");
  assert.equal(out.reduced.rows_out, 120);
  assert.ok(log.every((x) => x.method === "GET" && x.range), "a zip is read by range only");
  assert.ok(!JSON.stringify([out, w.prov.receipts]).includes("SENTINEL") && !stored(w).join("").includes("SENTINEL"));
  /* sliced */
  const bounds = { stream_max: BOUNDS.stream_max, segment_max: 900 };
  const one = await call(setup(), { [URLZ]: served(zip, { type: "application/zip" }) }, (s) => streamRegister(s, { definition: D, piece: "receipts", import: "imp-z", budget_bytes: 1 }, { bounds }));
  assert.equal(one.out.done, false);
  assert.equal(one.out.checkpoint, "member_start", "a deflate member checkpoints at its start");
  /* a source that does not serve ranges cannot give a member */
  const noRange = await call(setup(), { [URLZ]: served(zip, { type: "application/zip", ranges: false }) }, (s) => streamRegister(s, { definition: D, piece: "receipts", import: "imp-z" }, { bounds: BOUNDS }));
  assert.equal(noRange.out.reason, "RANGE_UNSUPPORTED");
  /* a member the zip does not hold */
  const D2 = DEF("county_raw"); D2.pieces[0].member = "NOPE.TSV";
  assert.equal((await call(setup(), { [URLZ]: served(zip, { type: "application/zip" }) }, (s) => streamRegister(s, { definition: D2, piece: "receipts", import: "i" }, { bounds: BOUNDS }))).out.reason, "MEMBER_MISSING");
});

/* ---------------- R128 ---------------- */
test("R128: a probe states a piece's size and change from a HEAD and, where the source counts for the filter, its own count; it never fetches a body and never calls a figure counted unless the source counted it", async () => {
  const w = setup();
  const log = [];
  const COUNT = `https://${HOST}/count`;
  const routes = (url, init) => {
    if (url.startsWith(COUNT)) { log.push({ count: url }); return new Response(JSON.stringify([{ count: "4200" }]), { headers: { "content-type": "application/json" } }); }
    return served(enc(csv(5)), { log })(url, init);
  };
  const D = DEF("town_filings");
  const dated = { date: { from: "2025-01-01", to: "2025-06-30" } };
  const a = await call(w, routes, (s) => probeRegister(s, { definition: D, piece: "all", holes: { table: "2025" }, filter: dated }));
  assert.equal(a.out.ok, true, JSON.stringify(a.out));
  assert.deepEqual(a.out.bytes, { value: enc(csv(5)).length, basis: "stated" });
  assert.deepEqual(a.out.rows, { value: 4200, basis: "counted" });
  assert.deepEqual(a.out.validators, { etag: '"v1"', last_modified: "Wed, 01 Oct 2025 00:00:00 GMT", content_length: String(enc(csv(5)).length), count: "4200" });
  assert.equal(a.out.source_date, "2025-10-01");
  assert.deepEqual(a.out.reached, ["head", "count"]);
  assert.equal(a.out.timed_out, false);
  const count = log.find((x) => x.count);
  assert.match(count.count, /table=2025/);
  assert.match(count.count, /date_from=2025-01-01/);
  assert.deepEqual(log.filter((x) => x.method && x.method !== "HEAD" && !x.range), [], "the source saw no body request");
  assert.deepEqual([w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0], "nothing recorded or stored");
  /* an unsupported criterion (a name) is not counted; an empty filter is counted for the whole piece */
  const names = await call(setup(), routes, (s) => probeRegister(s, { definition: D, piece: "all", holes: { table: "2025" }, filter: { names: ["Rosa Martinez"] } }));
  assert.deepEqual(names.out.rows, { value: null, basis: "not_stated" });
  assert.deepEqual(names.out.reached, ["head"]);
  const all = await call(setup(), routes, (s) => probeRegister(s, { definition: D, piece: "all", holes: { table: "2025" } }));
  assert.deepEqual(all.out.rows, { value: 4200, basis: "counted" });
  /* a source giving no Content-Length: bytes not stated */
  const bare = await call(setup(), { [URL_]: served(enc(csv(5)), { length: false }) }, (s) => probeRegister(s, { definition: DEF("county_raw") && { ...D, count: undefined }, piece: "all", holes: { table: "2025" } }));
  assert.deepEqual(bare.out.bytes, { value: null, basis: "not_stated" });
  assert.deepEqual(bare.out.rows, { value: null, basis: "not_stated" });
  /* a source that will not answer HEAD is asked for one byte */
  const noHead = await call(setup(), { [URL_]: (u, init) => ((init.method || "GET") === "HEAD" ? new Response("no", { status: 405 }) : served(enc(csv(5)))(u, init)) }, (s) => probeRegister(s, { definition: { ...D, count: undefined }, piece: "all", holes: { table: "2025" } }));
  assert.deepEqual([noHead.out.ok, noHead.out.bytes.value, noHead.out.reached], [true, enc(csv(5)).length, ["range"]]);
  assert.equal(noHead.net.seen.at(-1).init.headers.range, "bytes=0-0");
  /* a probe of an unchanged source twice gives equal validators */
  const b = await call(setup(), routes, (s) => probeRegister(s, { definition: D, piece: "all", holes: { table: "2025" }, filter: dated }));
  assert.deepEqual(b.out.validators, a.out.validators);
});

test("R128: a slow count ends the probe at budget_ms with what was reached; a gated register is not probed", async () => {
  const D = DEF("town_filings");
  const COUNT = `https://${HOST}/count`;
  const routes = (url, init) => (url.startsWith(COUNT) ? () => new Promise((r) => setTimeout(() => r(new Response("1")), 400)) : served(enc(csv(5)))(url, init));
  const t0 = Date.now();
  const slow = await call(setup(), routes, (s) => probeRegister(s, { definition: D, piece: "all", holes: { table: "2025" }, budget_ms: 60 }));
  assert.equal(slow.out.ok, true);
  assert.equal(slow.out.timed_out, true);
  assert.ok(Date.now() - t0 < 350, "ended at the budget, not at the slow answer");
  assert.deepEqual(slow.out.reached, ["head"]);
  assert.deepEqual(slow.out.rows, { value: null, basis: "not_stated" });
  const gated = await call(setup(), routes, (s) => probeRegister(s, { definition: DEF("trades_licences"), piece: "all" }));
  assert.deepEqual([gated.out.ok, gated.out.reason, gated.net.seen.length], [false, "member_act_required", 0]);
});

/* ---------------- R129 ---------------- */
test("R129: an unchanged source is not fetched again: a refresh whose validators agree sends no body request; a moved Last-Modified, a definition naming none and `force` each fetch", async () => {
  const D = DEF("county_raw");
  const zip = makeZip([{ name: "RECEIPTS.TSV", data: "FILING\tPAYER\tSUM\tWHEN\tREFNO\nC1\tA\t1\t2025-01-01\tR1\n" }]);
  const URLZ = "https://files.marlow-county.example/raw.zip";
  const log = [];
  const first = await call(setup(), { [URLZ]: served(zip, { type: "application/zip", log }) }, (s) => probeRegister(s, { definition: D, piece: "receipts" }));
  const last = first.out;
  assert.deepEqual(last.refresh_validators, ["last_modified", "content_length"]);
  assert.equal(sourceChanged(last, last, D), false);
  const bodyRequests = () => log.filter((x) => x.method === "GET");
  log.length = 0;
  const same = await call(setup(), { [URLZ]: served(zip, { type: "application/zip", log }) }, (s) => streamRegister(s, { definition: D, piece: "receipts", import: "i", refresh: { probe: last } }, { bounds: BOUNDS }));
  assert.deepEqual([same.out.ok, same.out.reason], [false, "REFRESH_UNCHANGED"]);
  assert.deepEqual(same.out.validators.last_modified, last.validators.last_modified);
  assert.equal(bodyRequests().length, 0, "zero body requests");
  /* control: Last-Modified moved */
  log.length = 0;
  const moved = await call(setup(), { [URLZ]: served(zip, { type: "application/zip", modified: "Thu, 02 Oct 2025 00:00:00 GMT", log }) }, (s) => streamRegister(s, { definition: D, piece: "receipts", import: "i", refresh: { probe: last } }, { bounds: BOUNDS }));
  assert.equal(moved.out.ok, true);
  assert.ok(bodyRequests().length > 0);
  /* a definition that names no validators always fetches */
  const bare = structuredClone(D); delete bare.refresh;
  const none = await call(setup(), { [URLZ]: served(zip, { type: "application/zip" }) }, (s) => streamRegister(s, { definition: bare, piece: "receipts", import: "i", refresh: { probe: last } }, { bounds: BOUNDS }));
  assert.equal(none.out.ok, true);
  assert.equal(sourceChanged(last, last, bare), true);
  /* `force` fetches an unchanged source */
  const forced = await call(setup(), { [URLZ]: served(zip, { type: "application/zip" }) }, (s) => streamRegister(s, { definition: D, piece: "receipts", import: "i", refresh: { probe: last }, force: true }, { bounds: BOUNDS }));
  assert.equal(forced.out.ok, true);
  /* sourceChanged: a validator not stated is a change; it never throws */
  assert.equal(sourceChanged({ validators: { etag: null }, refresh_validators: ["etag"] }, { validators: { etag: null } }), true);
  assert.equal(sourceChanged(null, null), true);
  assert.equal(sourceChanged({ validators: { etag: '"a"' } }, { validators: { etag: '"a"' } }, { refresh: { validators: ["etag"] } }), false);
});

/* ---------------- R132 ---------------- */
test("R132: a register is fetched only from its definition's hosts: a redirect to another host is refused and not followed; a redirect among the definition's hosts is followed; every request passes the governor under the agent", async () => {
  const text = csv(4);
  const seen = [];
  const w = setup();
  const foreign = await call(w, (u, init) => { seen.push(u); return u === URL_ ? new Response(null, { status: 302, headers: { location: "https://elsewhere.example/loot.csv" } }) : new Response(text); },
    (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: BOUNDS }));
  assert.deepEqual([foreign.out.ok, foreign.out.reason, foreign.out.host], [false, "HOST_NOT_IN_DEFINITION", "elsewhere.example"]);
  assert.deepEqual(seen, [URL_], "the foreign host was never asked");
  assert.equal(w.prov.receipts.length, 0);
  /* the federal files: the zip's host and its storage host are both the system's; the header file is a separate piece */
  const D = DEF("federal_individual");
  const rows = Array.from({ length: 12 }, (_, i) => `C${100 + i}|Donor ${i}|${25 + i}|2026-01-0${1 + (i % 9)}|Port Ellery|0410${i % 10}`).join("\n") + "\n";
  const zip = makeZip([{ name: "itcont.txt", data: rows }]);
  const hdr = "CMTE_ID,NAME,AMT,DT,CITY,ZIP\n";
  const ZIPURL = "https://store.federal.example/indiv2026.zip", STORAGE = "https://bulk.federal.example/stor/indiv2026.zip", HDR = "https://bulk.federal.example/headers/indiv_header.csv";
  const hops = [];
  const fed = await call(setup(), (u, init) => { hops.push(u);
    if (u === ZIPURL) return new Response(null, { status: 302, headers: { location: STORAGE } });
    if (u === STORAGE) return served(zip, { type: "application/zip" })(u, init);
    if (u === HDR) return new Response(hdr, { headers: { "content-type": "text/csv" } });
    return new Response("no", { status: 404 }); },
    (s) => streamRegister(s, { definition: D, piece: "cycle", holes: { cycle: "2026" }, import: "imp-f", viewer: "member:m1" }, { bounds: BOUNDS }));
  assert.equal(fed.out.ok, true, JSON.stringify(fed.out));
  assert.equal(fed.out.reduced.rows_out, 12);
  assert.ok(hops.includes(STORAGE), "the redirect within the definition's hosts was followed");
  for (const x of fed.net.seen) assert.equal(x.init.headers["user-agent"], civicsmithUserAgent("9.9.9", "inst", "register"));
  /* the same-host redirect of a plain piece is followed (control) */
  const same = await call(setup(), (u) => (u === URL_ ? new Response(null, { status: 301, headers: { location: `https://${HOST}/files/moved.csv` } }) : new Response(text)), (s) => streamRegister(s, { ...BASE, definition: DEF("town_filings") }, { bounds: BOUNDS }));
  assert.equal(same.out.ok, true);
  /* the hop carries the definition's terms basis (a definition without one fetches nothing, R125's test) */
  assert.equal(fed.out.documents[0].capture.reduced.terms_basis, D.terms_basis);
});

/* ---------------- R133 ---------------- */
test("R133: a piece imported twice lands one capture for each segment and the second answers existed with nothing to promote; a changed row lands; a different filter lands its own; the same reduced bytes again in one import are one capture", async () => {
  const D = DEF("town_filings");
  const w = setup();
  const text = csv(20);
  const r1 = await call(w, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: D }, { bounds: BOUNDS }));
  assert.equal(r1.out.documents.length, 1);
  assert.deepEqual(r1.out.documents[0].origin, { kind: "named_request", import: "imp-1", piece: "all", segment: 0, final: true });
  const r2 = await call(w, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: D, import: "imp-2" }, { bounds: BOUNDS }));
  assert.deepEqual(r2.out.segments.map((x) => [x.sha256, x.existed]), r1.out.segments.map((x) => [x.sha256, true]));
  assert.equal(r2.out.documents.length, 0, "nothing new to promote");
  assert.equal(w.prov.receipts.length, 1, "one receipt for the one capture");
  const r3 = await call(w, { [URL_]: served(enc(text.replace("Donor 7,", "Donor Seven,"))) }, (s) => streamRegister(s, { ...BASE, definition: D, import: "imp-3" }, { bounds: BOUNDS }));
  assert.deepEqual([r3.out.segments[0].existed, r3.out.documents.length], [false, 1], "a changed row lands");
  const r4 = await call(w, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: D, import: "imp-4", filter: { forms: ["460-3"] } }, { bounds: BOUNDS }));
  assert.deepEqual([r4.out.segments[0].existed, r4.out.reduced.rows_out], [false, 1], "a different filter lands its own segments");
  /* the same reduced bytes a second time in one import are one capture */
  const again = await call(w, { [URL_]: served(enc(text)) }, (s) => streamRegister(s, { ...BASE, definition: D, import: "imp-1" }, { bounds: BOUNDS }));
  assert.deepEqual([again.out.segments[0].existed, again.out.documents.length, w.prov.receipts.length], [true, 0, 3], "no new receipt: three captures in all (the first, the changed row, the other filter)");
});
