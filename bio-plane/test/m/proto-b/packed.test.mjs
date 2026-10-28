/* PROTO-PACKED (throwaway): packing, offsets, range arithmetic, compact index, search; the flag unset does nothing. */
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { protoPackedProbe, protoPackedProbeOp, packLines, deltaEncode, deltaDecode, runsOf, rangeOf, firstKRuns, buildIndex, indexBody, tokens } from "../../../src/proto-b/packed.mjs";

const room = () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE capture_text (capture_sha TEXT, bundle_id TEXT, extent_kind TEXT, extent TEXT, ref TEXT, seq INTEGER, text TEXT,
             PRIMARY KEY (capture_sha, extent_kind, extent));
           CREATE VIRTUAL TABLE capture_text_fts USING fts5(text, content='capture_text', content_rowid='rowid', tokenize='unicode61');`);
  const ins = db.prepare(`INSERT INTO capture_text VALUES (?,?,?,?,?,?,?)`);
  for (let c = 0; c < 3; c++) for (let s = 0; s < 4; s++)
    ins.run(`sha${c}`, `b${c % 2}`, "doc-para", `{"n":${s}}`, `para ${s}`, s, `zoning variance ${s % 2 ? "hearing" : "notice"} number ${s} parcel${c} café`);
  db.exec(`INSERT INTO capture_text_fts(rowid, text) SELECT rowid, text FROM capture_text`);
  const sql = { exec(q, ...a) { const rows = db.prepare(q).all(...a); return { toArray: () => rows, rowsRead: rows.length }; } };
  return { db, sql };
};
const bucket = () => { const m = new Map(); const log = []; return { m, log,
  put: async (k, v) => { m.set(k, String(v)); },
  get: async (k, opt) => { log.push([k, opt && opt.range]); if (!m.has(k)) return null;
    let v = m.get(k); if (opt && opt.range) v = Buffer.from(v).subarray(opt.range.offset, opt.range.offset + opt.range.length).toString();
    return { text: async () => v }; } }; };

test("packLines: offsets are byte offsets (multi-byte text), lengths include the newline, range slices exactly the lines", () => {
  const rs = [{ k: "a", e: "1", ref: "r", seq: 0, text: "café" }, { k: "a", e: "2", ref: "r", seq: 1, text: "naïve ☃" }, { k: "a", e: "3", ref: "r", seq: 2, text: "x" }];
  const p = packLines(rs), body = Buffer.from(p.lines.join(""));
  assert.equal(p.end, body.length); assert.deepEqual(p.q, [0, 1, 2]);
  assert.equal(p.o[0], 0); assert.equal(p.o[1], p.l[0]); assert.equal(p.o[2], p.l[0] + p.l[1]);
  const b = { o: p.o, l: p.l };
  const r = rangeOf(b, 1, 3);
  assert.equal(r.offset, p.o[1]); assert.equal(r.length, p.l[1] + p.l[2]);
  const got = body.subarray(r.offset, r.offset + r.length).toString().split("\n").filter(Boolean).map((s) => JSON.parse(s));
  assert.deepEqual(got.map((x) => x.seq), [1, 2]); assert.equal(got[0].text, "naïve ☃");
  assert.equal(packLines(rs, 100).o[0], 100);
});

test("delta coding round-trips; runs group adjacent positions", () => {
  const xs = [0, 1, 2, 7, 8, 20];
  assert.deepEqual(deltaDecode(deltaEncode(xs)), xs);
  assert.deepEqual(runsOf(xs), [[0, 3], [7, 9], [20, 21]]);
  assert.deepEqual(runsOf([]), []);
});

test("compact index: lowercase tokens as tokens(), positions across captures with a base, integers only", () => {
  const idx = new Map();
  buildIndex(["Zoning A", "zoning b"], idx, 0); buildIndex(["Zoning c"], idx, 2);
  assert.deepEqual(idx.get("zoning"), [0, 1, 2]); assert.deepEqual(tokens("Zoning A"), ["zoning"]);
  const body = JSON.parse(indexBody(idx));
  assert.deepEqual(body.zoning, [0, 1, 1]);
  assert.ok(Object.values(body).every((a) => a.every(Number.isInteger)));
});

test("copy, read, search and bytes: R2 under proto-packed/ only, room unchanged, reads are range gets, both searches agree", async () => {
  const { db, sql } = room(), b = bucket();
  const before = JSON.stringify(db.prepare(`SELECT * FROM capture_text ORDER BY capture_sha, seq`).all());
  const r = await protoPackedProbe({ sql, bucket: b, store: "t", args: { n: "3", k: "6", term: "hearing", hits: "20" } });
  assert.equal(r.copy.units, 12); assert.equal(r.copy.bundles, 2);
  assert.equal(r.copy.objects_written, 5);   /* 2 units + 2 index + manifest */
  assert.ok([...b.m.keys()].every((k) => k.startsWith("proto-packed/t/")));
  assert.ok(r.copy.bytes_written.units_objects > 0 && r.copy.bytes_written.index_objects > 0 && r.copy.bytes_written.manifest > 0);
  assert.ok(r.copy.js_held_peak_bytes > 0);
  assert.ok(r.copy.process_memory.before === null || typeof r.copy.process_memory.before.rss === "number");
  assert.equal(r.read.room.units, 6); assert.equal(r.read.r2.units, 6);
  /* first 6 units = bundle b0 (sha0, sha2: 8 units) positions 0..5: ONE range get */
  assert.equal(r.read.r2.r2_gets, 1); assert.equal(r.read.r2.room_rows_read, 0);
  assert.equal(r.search.room_fts.matches, 6); assert.equal(r.search.r2_packed.matches, 6);
  assert.equal(r.search.r2_packed.text_fetched, 6);
  assert.ok(r.search.r2_packed.unit_range_gets <= 6);
  assert.equal(r.bytes.room_rows_this_layout_would_save.capture_text_rows_exact, 12);
  assert.ok(r.bytes.r2.total_bytes > 0);
  assert.equal(r.bytes.room_rows_this_layout_would_save.basis.capture_text_total_rows, 12);
  assert.equal(JSON.stringify(db.prepare(`SELECT * FROM capture_text ORDER BY capture_sha, seq`).all()), before);
  /* the range gets returned exactly the stored lines */
  const man = JSON.parse(b.m.get("proto-packed/t/manifest"));
  const runs = firstKRuns(man, 6); assert.deepEqual(runs, [{ bi: 0, from: 0, to: 6 }]);
});

test("a search with scattered hits makes one range get per run, and a single-hit term reads one unit", async () => {
  const { sql } = room(), b = bucket();
  await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "copy", n: "3" } });
  b.log.length = 0;
  const r = await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "search_r2", term: "hearing", hits: "20" } });
  /* hearing at odd seqs: bundle b0 (8 units) positions 1,3,5,7, b1 (4 units) 1,3: 6 runs */
  assert.equal(r.search.r2_packed.unit_range_gets, 6); assert.equal(r.search.r2_packed.text_fetched, 6);
  b.log.length = 0;
  const r2 = await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "search_r2", term: "notice", hits: "20" } });
  assert.equal(r2.search.r2_packed.matches, 6);
  const r3 = await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "search_r2", term: "parcel1" } });
  assert.equal(r3.search.r2_packed.matches, 4); assert.equal(r3.search.r2_packed.unit_range_gets, 1, "four adjacent units: one get");
  const r4 = await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "search_r2", term: "nothingwhere" } });
  assert.equal(r4.search.r2_packed.matches, 0); assert.equal(r4.search.r2_packed.unit_range_gets, 0);
});

test("maxunits and n are capped, maxunits limits units; copy=1 redoes, otherwise the manifest is reused", async () => {
  const { sql } = room(), b = bucket();
  const r = await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "copy", maxunits: "5", n: "99999" } });
  assert.equal(r.n, 500); assert.equal(r.copy.units, 5);
  const again = await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "copy", maxunits: "9" } });
  assert.equal(again.copy.reused_manifest, true); assert.equal(again.copy.units, 5);
  const redo = await protoPackedProbe({ sql, bucket: b, store: "t", args: { phase: "copy", maxunits: "9", copy: "1" } });
  assert.equal(redo.copy.units, 9);
  const noman = await protoPackedProbe({ sql, bucket: bucket(), store: "t", args: { phase: "read" } });
  assert.match(noman.error, /run phase=copy first/);
});

test("the op: flag unset does nothing (null, no stub call); admin gate; arguments forwarded", async () => {
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s });
  const u = new URL("http://x/?op=protopackedprobe&phase=read&k=5&evil=1");
  let called = 0; const stub = { fetch: async () => { called++; return json({ ok: true }); } };
  assert.equal(await protoPackedProbeOp(u, {}, stub, { cls: "admin", json }), null);
  assert.equal(await protoPackedProbeOp(u, { PROTO_PACKED: "0", CAPTURES: {} }, stub, { cls: "admin", json }), null);
  assert.equal(await protoPackedProbeOp(u, { PROTO_B: "1", CAPTURES: {} }, stub, { cls: "admin", json }), null, "PROTO_B alone does not turn it on");
  assert.equal(called, 0);
  const env = { PROTO_PACKED: "1" };
  assert.equal((await protoPackedProbeOp(u, env, stub, { cls: "member", json })).status, 403);
  assert.equal((await protoPackedProbeOp(u, env, stub, { cls: "member", json, administer: true })).status, 503, "past the gate, no CAPTURES");
  let seen; const stub2 = { fetch: async (x) => { seen = x; return json({ ok: true }); } };
  assert.equal((await protoPackedProbeOp(u, { ...env, CAPTURES: {} }, stub2, { cls: "admin", json })).status, 200);
  assert.equal(seen, "http://x/protopackedprobe?k=5&phase=read");
});
