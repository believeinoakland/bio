/* PROTO_WINDOW_BYTES / PROTO_CHAIN_BYTES (throwaway measuring prototype): the same capture_text rows with and without the flags; unset = base behaviour. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";
import { protoWindowBytes, protoChain } from "../../../src/reading-pipeline/index.mjs";

const lines = (n) => Array.from({ length: n }, (_, i) => `line ${String(i).padStart(5, "0")} ` + "council-minutes é ".repeat(5).padEnd(88, ".")).concat(["ENDMARKER"]).join("\n");
/* long lines: a few lines of 20-300 KB (some over the 128 KiB unit cap), amid short ones, multi-byte characters */
const longLines = () => Array.from({ length: 60 }, (_, i) => (i % 7 === 3 ? ("wörd ".repeat(20000 + i * 5000)).trim() : `short ${i} ` + "é".repeat(30))).join("\n");

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
  try { do { a = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env }); calls++; } while (a.more === true && ++n < 800); } finally { console.log = orig; }
  const state = { ...w.one(`SELECT state,offered,written,over_bound,unaddressable,truncated,skipped_named,more FROM capture_text_state WHERE capture_sha=?`, d) };
  const units = w.rows(`SELECT seq,extent_kind,extent,text FROM capture_text WHERE capture_sha=? ORDER BY seq`, d).map((r) => [r.seq, r.extent_kind, r.extent, r.text]);
  const chain = logs.filter((l) => l.startsWith('{"proto_chain"')).map((l) => JSON.parse(l).proto_chain);
  return { state, units, calls, chain };
}

test("protoWindowBytes: unset/invalid = null; n clamped to [16 KiB, 1 MiB]; auto = clamp(units x 256, 64 KiB, 1 MiB)", () => {
  for (const v of [undefined, "", "0", "-1", "x", "1.5", null]) assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: v }, 512), null, String(v));
  assert.equal(protoWindowBytes({}, 512), null);
  assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: "100" }), 16384);
  assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: "300000" }), 300000);
  assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: "99999999" }), 1048576);
  assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: "auto" }, 512), 131072);
  assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: "auto" }, 100), 65536);
  assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: "auto" }, 4096), 1048576);
  assert.equal(protoWindowBytes({ PROTO_WINDOW_BYTES: "auto" }, 99999), 1048576);
});

for (const [label, body] of [["12,000 lines", lines(12000)], ["very long lines", longLines()]]) {
  test(`PROTO_WINDOW_BYTES (${label}): the capture_text rows and final state equal the unset run`, async () => {
    const u = await run(body, { PROTO_PIECE_UNITS: "512" });
    assert.ok(u.units.length > 50);
    for (const wb of ["auto", "16384", "100000", "1048576"]) {
      const r = await run(body, { PROTO_PIECE_UNITS: "512", PROTO_WINDOW_BYTES: wb });
      assert.deepEqual(r.units, u.units, `rows for ${wb}`);
      assert.deepEqual(r.state, u.state, `state for ${wb}`);
    }
    const r4 = await run(body, { PROTO_WINDOW_BYTES: "auto" }), b4 = await run(body, {});
    assert.deepEqual(r4.units, b4.units); assert.deepEqual(r4.state, b4.state);
  });
}

test("PROTO_CHAIN_BYTES: counted bytes per step are logged; rows unchanged; unset logs nothing", async () => {
  const body = lines(12000);
  const u = await run(body, {});
  assert.equal(u.chain.length, 0);
  protoChain.bytes = 0;
  const r = await run(body, { PROTO_PIECE_UNITS: "512", PROTO_CHAIN_BYTES: "16777216", PROTO_WINDOW_BYTES: "auto" });
  assert.ok(r.chain.length >= 2, "a line per step");
  assert.ok(r.chain.every((c) => c.piece_units === 512 && c.window_bytes === 131072 && c.rested === false && c.isolate_age_ms >= 0));
  assert.ok(r.chain.at(-1).chain_bytes >= body.length, `counted ${r.chain.at(-1).chain_bytes} of ${body.length}`);
  assert.deepEqual(r.units, (await run(body, { PROTO_PIECE_UNITS: "512" })).units);
  protoChain.bytes = 0;
});
