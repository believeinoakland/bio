/* PROTO_PIECE_UNITS (throwaway measuring prototype): a smaller piece size reads the same file in more pieces with the same rows and state; unset or invalid = 4096. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";

const LINES = 12000;
const big = () => Array.from({ length: LINES }, (_, i) => `line ${String(i).padStart(5, "0")} ` + "council-minutes é ".repeat(5).padEnd(88, ".")).concat(["ENDMARKER"]).join("\n");

async function run(body, env) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: homesOver(rows) });
  bundle(w.s, "INFO-1");
  const bytes = new TextEncoder().encode(body), d = sha(bytes);
  rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  const logs = [], orig = console.log;
  console.log = (...a) => { logs.push(a.join(" ")); };
  let n = 0, a, calls = 0;
  try { do { a = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env }); calls++; } while (a.more === true && ++n < 400); } finally { console.log = orig; }
  const state = { ...w.one(`SELECT state,offered,written,over_bound,unaddressable,truncated,skipped_named,more FROM capture_text_state WHERE capture_sha=?`, d) };
  const units = w.rows(`SELECT seq,extent_kind,extent,text FROM capture_text WHERE capture_sha=? ORDER BY seq`, d).map((r) => ({ ...r }));
  const rd = logs.filter((l) => l.startsWith('{"proto_readout_read"')).map((l) => JSON.parse(l).proto_readout_read);
  const ro = logs.filter((l) => l.startsWith('{"proto_readout"')).map((l) => JSON.parse(l).proto_readout);
  return { state, units, calls, rd, ro, more: a.more };
}

test("PROTO_PIECE_UNITS=512: more pieces, the same capture_text rows and final state as unset", async () => {
  const body = big();
  const u = await run(body, { PROTO_READOUT: "0", CAPTURES: bucket() }), p = await run(body, { PROTO_READOUT: "0", CAPTURES: bucket(), PROTO_PIECE_UNITS: "512" });
  assert.ok(u.units.length > 12000);
  assert.ok(p.calls > u.calls, `pieces ${p.calls} > ${u.calls}`);
  assert.ok(p.rd.every((r) => r.units <= 512), "no piece over 512 units");
  assert.ok(p.rd.every((r) => r.piece_units === 512) && p.ro.every((r) => r.piece_units === 512));
  assert.ok(u.rd.every((r) => r.piece_units === 4096));
  assert.equal(p.units.length, u.units.length);
  assert.deepEqual(p.units.map((x) => [x.seq, x.extent, x.text]), u.units.map((x) => [x.seq, x.extent, x.text]));
  assert.deepEqual(p.state, u.state);
  assert.equal(p.state.state, "whole");
  assert.notEqual(p.more, true);
  console.log(`# pieces unset=${u.calls} at512=${p.calls}`);
});

test("PROTO_PIECE_UNITS unset, empty, zero, negative, fractional, non-numeric = 4096 behaviour", async () => {
  const body = big();
  const u = await run(body, { PROTO_READOUT: "0", CAPTURES: bucket() });
  for (const v of ["", "0", "-5", "1.5", "abc", "12x", null]) {
    const r = await run(body, { PROTO_READOUT: "0", CAPTURES: bucket(), PROTO_PIECE_UNITS: v });
    assert.equal(r.calls, u.calls, `calls for ${JSON.stringify(v)}`);
    assert.deepEqual(r.rd.map((x) => x.units), u.rd.map((x) => x.units));
    assert.ok(r.rd.every((x) => x.piece_units === 4096));
    assert.deepEqual(r.units.map((x) => [x.seq, x.text]), u.units.map((x) => [x.seq, x.text]));
    assert.deepEqual(r.state, u.state);
  }
  const big4 = await run(body, { PROTO_READOUT: "0", CAPTURES: bucket(), PROTO_PIECE_UNITS: "999999" });
  assert.deepEqual(big4.units.map((x) => x.seq), u.units.map((x) => x.seq));
});
