/* PROTO-B (throwaway): the probe copies units to a bucket under `proto-b/` only, changes no room row, and answers the same hits both ways. */
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { protobProbe, protobProbeOp } from "../../../src/proto-b/probe.mjs";

const room = () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE capture_text (capture_sha TEXT, bundle_id TEXT, extent_kind TEXT, extent TEXT, ref TEXT, seq INTEGER, text TEXT,
             PRIMARY KEY (capture_sha, extent_kind, extent));
           CREATE VIRTUAL TABLE capture_text_fts USING fts5(text, content='capture_text', content_rowid='rowid', tokenize='unicode61');`);
  const ins = db.prepare(`INSERT INTO capture_text VALUES (?,?,?,?,?,?,?)`);
  for (let c = 0; c < 3; c++) for (let s = 0; s < 4; s++)
    ins.run(`sha${c}`, `b${c % 2}`, "doc-para", `{"n":${s}}`, `para ${s}`, s, `zoning variance ${s % 2 ? "hearing" : "notice"} number ${s} parcel${c}`);
  db.exec(`INSERT INTO capture_text_fts(rowid, text) SELECT rowid, text FROM capture_text`);
  const sql = { exec(q, ...a) { const rows = db.prepare(q).all(...a); return { toArray: () => rows, rowsRead: rows.length }; } };
  return { db, sql };
};
const bucket = () => { const m = new Map(); return { m,
  put: async (k, v) => { m.set(k, String(v)); },
  get: async (k) => (m.has(k) ? { text: async () => m.get(k) } : null) }; };

test("copy, read, search and bytes: R2 holds proto-b/ only, the room is unchanged, both searches agree", async () => {
  const { db, sql } = room(), b = bucket();
  const before = JSON.stringify(db.prepare(`SELECT * FROM capture_text ORDER BY capture_sha, seq`).all());
  const r = await protobProbe({ sql, bucket: b, store: "t", args: { n: "3", k: "6", term: "hearing" } });
  assert.equal(r.copy.units, 12);
  assert.ok([...b.m.keys()].every((k) => k.startsWith("proto-b/t/")));
  assert.equal(r.read.room.units, 6); assert.equal(r.read.r2.units, 6);
  assert.equal(r.search.room_fts.matches, 6); assert.equal(r.search.r2_index.matches, 6);
  assert.equal(r.bytes.room.rows_for_these_captures, 12); assert.ok(r.bytes.r2.total_bytes > 0);
  assert.equal(JSON.stringify(db.prepare(`SELECT * FROM capture_text ORDER BY capture_sha, seq`).all()), before);
});

test("the op answers nothing without PROTO_B=1 and refuses a non-admin with it", async () => {
  const json = (o, s = 200) => ({ o, s });
  assert.equal(await protobProbeOp(new URL("https://x/?op=protobprobe"), {}, null, { cls: "admin", json }), null);
  assert.equal((await protobProbeOp(new URL("https://x/?op=protobprobe"), { PROTO_B: "1", CAPTURES: {} }, null, { cls: "member", json })).s, 403);
});
