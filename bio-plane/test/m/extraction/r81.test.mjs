/* extraction, R81 (T51 fix round 4, C5a/P8; K4481; amends R80; provenance R4; capture's `promoteDocument`): a capture held in
   parts is registered by its part digests only, so `provenance.homeOf(whole)` names no home; `readHeld` finds the home by the
   bundle whose `data/provenance.json` states the whole's digest and whose parts the register names. Each test names the
   requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, withEntry, i2, doc, sha } from "./fixture.mjs";

const pdf = (text) => ({ format: "pdf", structure: async () => ({ ok: true, text: structuredClone(text), pages: (text.pages || []).length, notes: [] }) });
const register = (rows) => ({ homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) });
const row = (bundleId, bytes = 20) => ({ bundleId, path: "a.pdf", encoding: "binary", bytes, registered: "t", authored: false });
const count = (w, table, d) => w.one(`SELECT count(*) c FROM ${table} WHERE capture_sha=?`, d).c;
const TEXT = i2([{ page: 0, text: "alpha beta gamma delta" }]);

/* The promotion capture's `promoteDocument` makes: the register names the two parts, the bundle's `data/provenance.json` names
   the whole and its parts, and the whole is not registered. `promoted: false` is a capture not yet promoted. */
function twoParts({ promoted = true, registerParts = true, bundleId = "INFO-1" } = {}) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: register(rows) });
  bundle(w.s, bundleId);
  const bytes = new TextEncoder().encode("%PDF-1.7 a budget kept in two parts " + Math.random());
  const d = sha(bytes);
  const half = Math.floor(bytes.length / 2);
  const parts = [bytes.subarray(0, half), bytes.subarray(half)].map((b, i) => ({ file: `p${i}.bin`, sha256: sha(b), bytes: b.length }));
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf", parts });
  if (promoted) {
    if (registerParts) for (const p of parts) rows.set(p.sha256, row(bundleId, p.bytes));
    w.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?,?,?,?,?,?)`,
      bundleId, "data/provenance.json", JSON.stringify({ documents: [document] }), null, 1, "x");
  }
  return { w, rows, evidence, bytes, d, parts, document };
}

test("R81 R80: a two-part capture, promoted and deferred, is read by `readHeld` once the whole is held; `op=reading` by the digest finds it", async () => {
  const { w, evidence, bytes, d, rows } = twoParts();
  assert.equal(rows.has(d), false, "the register names the parts, not the whole");
  assert.equal(w.x.readingFor(d, "class:admin").found, false);
  await evidence.put(`bio/captures/${d}`, bytes);
  const r = await withEntry(pdf(TEXT), () => w.x.readHeld({ sha: d }));
  assert.deepEqual([r.ok, r.read, r.bundle_id], [true, true, "INFO-1"]);
  const got = w.x.readingFor(d, "class:admin");
  assert.equal(got.found, true);
  assert.equal(got.bundle_id, "INFO-1", "written for the bundle that holds the parts");
  assert.match(got.text_units.map((u) => u.text).join(" "), /alpha beta gamma delta/);
  assert.equal(count(w, "readings", d), 1);
});

test("R81 R80: a second call changes nothing", async () => {
  const { w, evidence, bytes, d } = twoParts();
  await evidence.put(`bio/captures/${d}`, bytes);
  await withEntry(pdf(TEXT), () => w.x.readHeld({ sha: d }));
  const hist = count(w, "reading_history", d);
  const again = await withEntry(pdf(TEXT), () => w.x.readHeld({ sha: d }));
  assert.deepEqual([again.ok, again.read, again.why], [true, false, "READING_HELD"]);
  assert.equal(count(w, "reading_history", d), hist);
});

test("R81 (control): an unpromoted capture is still NO_HOME, though its whole is held", async () => {
  const { w, evidence, bytes, d } = twoParts({ promoted: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const r = await w.x.readHeld({ sha: d });
  assert.deepEqual([r.ok, r.read, r.why], [true, false, "NO_HOME"]);
  assert.equal(count(w, "readings", d), 0);
});

test("R81 (control): a bundle that names the digest but whose parts the register does not give it is no home", async () => {
  const { w, evidence, bytes, d } = twoParts({ registerParts: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const r = await w.x.readHeld({ sha: d });
  assert.deepEqual([r.ok, r.read, r.why], [true, false, "NO_HOME"]);
  assert.equal(count(w, "readings", d), 0);
});

test("R81 (control): a viewer who may not see the parts' bundle is answered NO_HOME", async () => {
  const { w, evidence, bytes, d } = twoParts();
  await evidence.put(`bio/captures/${d}`, bytes);
  const r = await w.x.readHeld({ sha: d, viewer: "class:nobody" });
  assert.deepEqual([r.ok, r.read, r.why], [true, false, "NO_HOME"]);
  assert.equal(count(w, "readings", d), 0);
});
