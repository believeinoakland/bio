/* PROTO_LEAN (throwaway measuring prototype): the streamed SHA-256 of a text over 4 Mi characters (readingprov) compresses in place with the flag; the digest, the capture_text rows
   and the state are the same with and without it; unset = the code as it was. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";
import { sha256Hex, setLean } from "../../../src/reading-pipeline/readingprov.mjs";

const lines = (n) => Array.from({ length: n }, (_, i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes é ".repeat(5).padEnd(88, ".")).concat(["ENDMARKER"]).join("\n");

test("setLean: only PROTO_LEAN === \"1\" turns it on; the streamed digest equals crypto's either way (over 4 Mi characters, multi-byte, a slice edge)", async () => {
  const text = lines(46000) + "\n" + "é".repeat(100) + "😀".repeat(50);   /* > 4,194,304 characters */
  assert.ok(text.length > 4 * 1024 * 1024);
  const want = createHash("sha256").update(text).digest("hex");
  for (const env of [undefined, {}, { PROTO_LEAN: "0" }, { PROTO_LEAN: "1" }, { PROTO_LEAN: "true" }]) {
    setLean(env);
    assert.equal(await sha256Hex(text, true), want, JSON.stringify(env));
    assert.equal(await sha256Hex(text, false), want, JSON.stringify(env) + " sync");
  }
  setLean({});
});

async function run(body, env) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: homesOver(rows) });
  bundle(w.s, "INFO-1");
  const bytes = new TextEncoder().encode(body), d = sha(bytes);
  rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  const orig = console.log; console.log = () => {};
  let n = 0, a;
  try { do { a = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env }); } while (a.more === true && ++n < 800); } finally { console.log = orig; }
  const state = { ...w.one(`SELECT state,offered,written,over_bound,unaddressable,truncated,skipped_named,more FROM capture_text_state WHERE capture_sha=?`, d) };
  const units = w.rows(`SELECT seq,extent_kind,extent,text,ref,kind,chain_kind,truncated FROM capture_text WHERE capture_sha=? ORDER BY seq`, d).map((r) => [r.seq, r.extent_kind, r.extent, r.text, r.ref, r.kind, r.chain_kind, r.truncated]);
  const rd = w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d);
  const j = rd ? JSON.parse(rd.reading) : null;
  const shas = j ? JSON.stringify(j).match(/"text_sha256":"[0-9a-f]{64}"/g) : null;
  return { state, units, shas };
}

for (const [label, n, piece] of [["a 4.4 MB text read whole (first piece hashes it)", 46000, {}], ["small text, pieces of 512", 3000, { PROTO_PIECE_UNITS: "512" }]]) {
  test(`PROTO_LEAN (${label}): capture_text rows, state and text_sha256 equal the unset run`, async () => {
    const body = lines(n);
    const base = await run(body, { ...piece });
    assert.ok(base.units.length > 100); assert.ok(base.shas && base.shas.length >= 1, "the reading states a text_sha256");
    for (const v of ["1", "0"]) {
      const r = await run(body, { ...piece, PROTO_LEAN: v });
      assert.deepEqual(r.units, base.units, `rows for ${v}`);
      assert.deepEqual(r.state, base.state, `state for ${v}`);
      assert.deepEqual(r.shas, base.shas, `text_sha256 for ${v}`);
    }
    setLean({});
  });
}
