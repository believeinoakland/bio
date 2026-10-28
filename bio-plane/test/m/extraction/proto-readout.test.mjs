/* PROTO_READOUT (throwaway measuring prototype): the packed write (offsets, round trip, counts equal the normal path's), unset does nothing new, "0" behaves as
   unset apart from the log lines, "1" without a bucket falls back to the normal write. Through `readHeld`, the module's real entry. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";

const LINES = 12000;
const big = () => Array.from({ length: LINES }, (_, i) => `line ${String(i).padStart(5, "0")} ` + "council-minutes é ".repeat(5).padEnd(88, ".")).concat(["ENDMARKER"]).join("\n");
const small = () => Array.from({ length: 40 }, (_, i) => `line ${i} héllo wörld`).join("\n");

async function home(body) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: homesOver(rows) });
  bundle(w.s, "INFO-1");
  const bytes = new TextEncoder().encode(body);
  const d = sha(bytes);
  rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  return { w, d };
}
async function run(body, env) {
  const { w, d } = await home(body);
  const logs = [], orig = console.log;
  console.log = (...a) => { logs.push(a.join(" ")); };
  let n = 0, a;
  try { do { a = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env }); } while (a.more === true && ++n < 60); } finally { console.log = orig; }
  const state = { ...w.one(`SELECT state,offered,written,over_bound,unaddressable,truncated,skipped_named,more FROM capture_text_state WHERE capture_sha=?`, d) };
  const rows = w.rows(`SELECT count(*) AS n FROM capture_text WHERE capture_sha=?`, d)[0].n;
  const ro = logs.filter((l) => l.startsWith('{"proto_readout"')).map((l) => JSON.parse(l).proto_readout);
  const rd = logs.filter((l) => l.startsWith('{"proto_readout_read"')).map((l) => JSON.parse(l).proto_readout_read);
  return { w, d, state, rows, ro, rd, logs, units: w.rows(`SELECT seq,extent_kind,extent,text FROM capture_text WHERE capture_sha=? ORDER BY seq`, d).map((r) => ({ ...r })) };
}
/* the fixture bucket keeps bytes; R2's put also takes a string, which the prototype hands it */
const strBucket = () => { const b = bucket(), put = b.put; b.put = (k, v) => put(k, typeof v === "string" ? new TextEncoder().encode(v) : v); return b; };
const lines = (b, key) => new TextDecoder().decode(b.held.get(key)).split("\n").filter(Boolean).map((l) => JSON.parse(l));

for (const [name, body] of [["one piece", small()], ["pieces", big()]]) {
  test(`PROTO_READOUT unset: ${name}: no log line, normal rows`, async () => {
    const r = await run(body, {});
    assert.equal(r.ro.length + r.rd.length, 0);
    assert.ok(r.rows > 0);
  });
  test(`PROTO_READOUT "0": ${name}: the same rows and state as unset, with log lines`, async () => {
    const u = await run(body, {}), z = await run(body, { PROTO_READOUT: "0", CAPTURES: bucket() });
    assert.deepEqual(z.state, u.state);
    assert.equal(z.rows, u.rows);
    assert.deepEqual(z.units.map((x) => [x.seq, x.extent, x.text]), u.units.map((x) => [x.seq, x.extent, x.text]));
    assert.ok(z.ro.length >= 1 && z.rd.length >= 1);
    assert.equal(z.ro[0].mode, "0"); assert.equal(z.ro[0].readout_active, false);
    assert.equal(z.ro.reduce((n, l) => n + l.room_rows_capture_text, 0), z.rows);
    assert.equal(z.ro[0].r2_objects, 0);
  });
  test(`PROTO_READOUT "1": ${name}: no capture_text rows, a packed object that round-trips through its manifest, state equal to the normal path's`, async () => {
    const u = await run(body, {}), bk = strBucket(), r = await run(body, { PROTO_READOUT: "1", CAPTURES: bk });
    assert.equal(r.rows, 0);
    assert.equal(r.w.rows(`SELECT count(*) AS n FROM capture_text_fts`)[0].n, 0, "no FTS rows");
    assert.deepEqual(r.state, u.state, "written/bytes accounting and state are the normal path's");
    const keys = [...bk.held.keys()].filter((k) => k.startsWith("proto-readout/bio/") && !k.endsWith(".manifest.json")).sort();
    assert.ok(keys.length >= 1);
    const got = [];
    let total = 0;
    for (const k of keys) {
      const man = JSON.parse(new TextDecoder().decode(bk.held.get(`${k}.manifest.json`)));
      const obj = bk.held.get(k);
      assert.equal(man.bytes, obj.length);
      total += man.units;
      for (const e of man.index) {
        const slice = new TextDecoder().decode(obj.subarray(e.offset, e.offset + e.bytes));
        const unit = JSON.parse(slice);
        assert.equal(unit.seq, e.seq); assert.equal(unit.extent, e.extent);
        got.push(unit);
      }
      const own = lines(bk, k);
      assert.equal(own.length, man.units);
      assert.ok(own.every((x, i) => i === 0 || x.seq > own[i - 1].seq), "newline-delimited, in seq order");
    }
    assert.equal(total, u.rows);
    got.sort((a, b) => a.seq - b.seq); // the pieces' objects are named by cursor; seq order within each is asserted above
    assert.deepEqual(got.map((x) => [x.seq, x.extent_kind, x.extent, x.text]), u.units.map((x) => [x.seq, x.extent_kind, x.extent, x.text]));
    assert.ok(r.ro.every((l) => l.mode === "1" && l.readout_active && l.r2_objects === 2 && l.room_rows_capture_text === 0));
    assert.equal(r.ro.reduce((n, l) => n + l.units, 0), u.rows);
    assert.ok(r.ro[0].held_proxy.packed_bytes > 0);
    assert.equal(r.w.one(`SELECT written FROM capture_text_state WHERE capture_sha=?`, r.d).written, u.state.written);
  });
}
test(`PROTO_READOUT "1" with no bucket: the normal write, logged as fallback`, async () => {
  const u = await run(small(), {}), r = await run(small(), { PROTO_READOUT: "1" });
  assert.equal(r.rows, u.rows);
  assert.deepEqual(r.state, u.state);
  assert.equal(r.ro[0].no_bucket_fallback, true); assert.equal(r.ro[0].readout_active, false);
});
