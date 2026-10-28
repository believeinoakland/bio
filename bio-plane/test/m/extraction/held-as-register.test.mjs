/* extraction R113 (T53; N1259; K4403 (2), (5); T53-130): A REGISTER SEGMENT IS NOT READ: its reading state is `held_as_register`. `registerHeldAs` takes a provider once; for a capture
   it holds, `read`, `readHeld` and `readingFor` hand it to no reader, write no reading and no index, and say so. Driven by a test provider, as the module that registers is a later one. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";

const spyReader = () => { const calls = []; return { calls, reader: async (document) => { calls.push(document); return { reading: { found: false, entities: [], at: "2026-10-28T00:00:00Z", basis: "b" } }; } }; };
const SEG = new TextEncoder().encode("name,amount\nAna,1\n");

async function home(reader) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: homesOver(rows), reader });
  bundle(w.s, "INFO-1");
  const d = sha(SEG);
  rows.set(d, { bundleId: "INFO-1", path: "seg.csv", encoding: "binary", bytes: SEG.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, SEG);
  const document = doc({ digest: d, bytes: SEG.length, ct: "text/csv", format: "csv", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  return { w, d, document };
}
const held = (d) => ({ holds: (s) => (s === d ? { register: "REG-1", import: "IMP-1" } : null) });

test("R113: a segment the provider holds is read by no reader and no reading is written; the state is held_as_register, not a failure", async () => {
  const spy = spyReader();
  const { w, d, document } = await home(spy.reader);
  assert.deepEqual(w.x.registerHeldAs("registers", held(d)), { ok: true, module: "registers" });
  const out = await w.x.read(document, { storeName: "bio", env: {} });
  assert.deepEqual([out.reading, out.held_as_register], [null, { register: "REG-1", import: "IMP-1" }]);
  const a = await w.x.readHeld({ sha: d, storeName: "bio", env: {} });
  assert.deepEqual([a.ok, a.read, a.why, a.held_as_register], [true, false, "HELD_AS_REGISTER", { register: "REG-1", import: "IMP-1" }]);
  assert.deepEqual(spy.calls, [], "reading-pipeline is never called");
  assert.deepEqual([w.rows(`SELECT count(*) n FROM readings`)[0].n, w.rows(`SELECT count(*) n FROM capture_text`)[0].n, w.rows(`SELECT count(*) n FROM reading_history`)[0].n], [0, 0, 0]);
  const r = w.x.readingFor(d, "class:admin");
  assert.deepEqual([r.found, r.reading, r.held_as_register], [false, null, { register: "REG-1", import: "IMP-1" }]);
  assert.equal(r.failure, undefined);
  assert.equal(w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH 'Ana'`).length, 0, "search never indexes it");
});

test("R113: a second registration is refused, a malformed one is refused", async () => {
  const { w, d } = await home(null);
  assert.equal(w.x.registerHeldAs("registers", {}).reason, "LISTENER_MALFORMED");
  assert.equal(w.x.registerHeldAs("registers", held(d)).ok, true);
  assert.equal(w.x.registerHeldAs("other", held(d)).reason, "LISTENER_DECLARED");
});

test("R113 (control): with no provider, or for a capture the provider does not hold, every capture is read as before; a throwing provider holds nothing", async () => {
  const spy = spyReader();
  const { w, d, document } = await home(spy.reader);
  assert.equal(w.x.readingFor(d, "class:admin").held_as_register, undefined);
  await w.x.read(document, { storeName: "bio", env: {} });
  assert.equal(spy.calls.length, 1);
  w.x.registerHeldAs("registers", held(sha("another")));
  await w.x.read(document, { storeName: "bio", env: {} });
  assert.equal(spy.calls.length, 2);
  const t = await home(spyReader().reader);
  t.w.x.registerHeldAs("registers", { holds: () => { throw new Error("down"); } });
  assert.equal(t.w.x.readingFor(t.d, "class:admin").held_as_register, undefined);
});
