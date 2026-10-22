/* extraction R95 (fix round 6, G40; K4620, K4622): A READ OF A SHEET KEEPS ITS READING'S JSON ONCE. The walker's shape is a 1 MB CSV (about 20,000 rows) whose
   reading is some 11 MB of JSON; the write path (`readHeld`, which `op=readheld` and the plane's ledger call) stringified it four times, digested copies of it
   three times and parsed a clone of it inside the transaction, which on the object's 128 MB passed its limit (`plane/shape/g15.probe.mjs`). Here the work is
   COUNTED at the module's real entry: the operations over 1 MB made by one `readHeld`, and when they are made. Each test names the requirement id it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha } from "./fixture.mjs";
import { sha256HexSync } from "../../../src/record-grammar/sha256.mjs";
import { ReadHooks } from "../../../src/reading-pipeline/index.mjs";
import { MODULE_ORDER } from "../../../src/membership/index.mjs";
import { datesOfReading } from "../../../src/events/follow.mjs";

const BIG = 1_000_000;
const register = (rows) => ({ homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) });
const csv = (bytes) => {
  const rows = ["id,name,amount,note"];
  for (let n = 20, i = 0; n < bytes; i++) { const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"`; rows.push(r); n += r.length + 1; }
  rows.push(`LASTROWMARK,"last name",1.00,"the final row of the sheet"`);
  return rows.join("\n") + "\n";
};
/* the fixture the pinned values below were taken on, from the code before G40 */
const csv4000 = () => ["id,name,amount,note"].concat(Array.from({ length: 4000 }, (_, i) => `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"`)).join("\n") + "\n";

async function home(text, { readHooks = null } = {}) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, readHooks, provenance: register(rows) });
  bundle(w.s, "INFO-1");
  const bytes = new TextEncoder().encode(text);
  const d = sha(bytes);
  rows.set(d, { bundleId: "INFO-1", path: "table.csv", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/csv", format: "undetermined", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  return { w, d, bytes };
}

/* Counts, over one call, what this module does with a large reading: `JSON.stringify` outputs over 1 MB, `TextEncoder.encode` inputs over 1 MB (the digest's
   copy of the string), and `JSON.parse` inputs over 1 MB, split by whether the record's transaction was open. The bytes of the document are not strings. */
async function counted(w, fn) {
  const c = { stringify: 0, encode: 0, parseInTx: 0, parseAfter: 0 };
  let inTx = 0;
  const tx = w.core.transact.bind(w.core);
  w.core.transact = (f) => { inTx++; try { return tx(f); } finally { inTx--; } };
  /* an after-commit callback runs inside `transact`'s frame but after the commit: it is not inside the transaction */
  const ac = w.core.afterCommit.bind(w.core);
  w.core.afterCommit = (f) => ac((...a) => { const was = inTx; inTx = 0; try { return f(...a); } finally { inTx = was; } });
  const S = JSON.stringify, P = JSON.parse, E = TextEncoder.prototype.encode;
  JSON.stringify = function (...a) { const r = S.apply(this, a); if (typeof r === "string" && r.length > BIG) c.stringify++; return r; };
  JSON.parse = function (...a) { if (typeof a[0] === "string" && a[0].length > BIG) c[inTx ? "parseInTx" : "parseAfter"]++; return P.apply(this, a); };
  TextEncoder.prototype.encode = function (s) { if (typeof s === "string" && s.length > BIG) c.encode++; return E.call(this, s); };
  try { const out = await fn(); return { c, out }; }
  finally { JSON.stringify = S; JSON.parse = P; TextEncoder.prototype.encode = E; w.core.transact = tx; w.core.afterCommit = ac; }
}

test("R95 (G40): a 1 MB CSV read through `readHeld` makes its reading's JSON once: one stringify over 1 MB, one digest copy over 1 MB, no parse over 1 MB inside the transaction", async () => {
  const { w, d, bytes } = await home(csv(1_048_576));
  assert.ok(bytes.length > 1_000_000);
  const { c, out } = await counted(w, () => w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} }));
  assert.deepEqual([out.ok, out.read], [true, true], JSON.stringify(out));
  const row = w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d);
  assert.ok(row.reading.length > BIG, `the reading is large (${row.reading.length} characters)`);
  assert.deepEqual(c, { stringify: 1, encode: 1, parseInTx: 0, parseAfter: c.parseAfter }, "one JSON of the reading, one digest copy of it, nothing parsed inside the transaction");
});

test("R95 (G40 control): the row, the history, `reading_sha256`, the history's provenance and the `composed_readings` digest are byte-identical to the code before G40 on the same fixture", async () => {
  const { w, d } = await home(csv4000());
  await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  const row = w.one(`SELECT reading, origin FROM readings WHERE capture_sha=?`, d);
  /* taken from the code before G40 (the reading is deterministic on this fixture: two runs agree) */
  assert.deepEqual([row.reading.length, sha256HexSync(row.reading)], [2585472, "1755e2e5588b621761021b990a1e38b3a59c6acbbfd776f0a720140e6969c3a3"]);
  const hist = w.rows(`SELECT reading_sha256, reading, provenance FROM reading_history WHERE capture_sha=?`, d);
  assert.equal(hist.length, 1);
  assert.deepEqual([hist[0].reading_sha256, hist[0].reading === row.reading, sha256HexSync(String(hist[0].provenance))],
                   ["1755e2e5588b621761021b990a1e38b3a59c6acbbfd776f0a720140e6969c3a3", true, "fd686251d57c441d44c159ea60eba1a1c54ff8efa79394c08a41d21290b0a31d"]);
  assert.deepEqual(w.rows(`SELECT reading_sha256 FROM composed_readings`).map((r) => r.reading_sha256), ["1755e2e5588b621761021b990a1e38b3a59c6acbbfd776f0a720140e6969c3a3"]);
  assert.equal(row.origin, "composed");
  assert.equal(JSON.stringify(JSON.parse(row.reading)), row.reading, "the stored text is JSON.stringify's own");
});

test("R95 (G40 control): a second read of the same capture (a re-read of the held reading) keeps both readings in the history with their digests, as before", async () => {
  const { w, d } = await home(csv4000());
  await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  const first = w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading;
  /* a different reading of the same capture, written the way a re-read writes (R19): the history keeps the first and adds this one */
  const next = { ...JSON.parse(first), at: "2026-10-22T00:00:00Z" };
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: next, composed: true }));
  const hist = w.rows(`SELECT seq, reading_sha256, reading FROM reading_history WHERE capture_sha=? ORDER BY seq`, d);
  assert.deepEqual(hist.map((h) => h.seq), [1, 2]);
  assert.deepEqual(hist.map((h) => h.reading_sha256), [sha256HexSync(first), sha256HexSync(JSON.stringify(next))]);
  assert.equal(hist[1].reading, w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
});

test("R95 (G40 control): a hook that mutates its argument leaves the stored row and the next hook's input unchanged; each hook gets its own object, equal to the reading as written", async () => {
  const hooks = new ReadHooks(), A = MODULE_ORDER[10], B = MODULE_ORDER[20], seen = [];
  hooks.onRead(A, ({ reading }) => { seen.push([A, JSON.stringify(reading)]); reading.entities = "mutated"; reading.found = "mutated"; delete reading.at; reading.facts = null; }, { captureClasses: ["generic"] });
  hooks.onRead(B, ({ reading }) => { seen.push([B, JSON.stringify(reading)]); }, { captureClasses: ["generic"] });
  const { w, d } = await home(csv4000(), { readHooks: hooks });
  const done = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  assert.deepEqual([done.ok, done.read], [true, true]);
  await new Promise((r) => setTimeout(r, 20));
  const row = w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading;
  assert.equal(sha256HexSync(row), "1755e2e5588b621761021b990a1e38b3a59c6acbbfd776f0a720140e6969c3a3", "the stored row is untouched by the first hook's changes");
  assert.deepEqual(seen.map((x) => x[0]), [A, B], "both ran, in order");
  assert.equal(seen[0][1], row, "the first hook was handed the reading as written");
  assert.equal(seen[1][1], row, "the second hook is handed the same, not what the first left");
});

test("R95 (G40 control): `events` still finds the dates of a dated reading: a hook registered for `meeting_minutes` is handed an object, not a string, and `datesOfReading` reads it", async () => {
  const hooks = new ReadHooks(), found = [];
  hooks.onRead("events", ({ captureClass, reading }) => { found.push([captureClass, typeof reading, datesOfReading(reading, null).map((x) => x.kind)]); }, { captureClasses: ["meeting_minutes"] });
  const w = fresh({ readHooks: hooks });
  bundle(w.s, "INFO-1");
  const reading = { content_type: "meeting_minutes", reader_version: 1, read_from_text: true, found: true, entities: [], facts: { date: "2026-03-04" },
                    at: "2026-09-27T00:00:00Z", basis: "b", text_source: null };
  const out = w.x.writeReading({ bundleId: "INFO-1", captureSha: "a".repeat(64), reading, composed: true });
  assert.deepEqual(await out.afterRead, { ran: ["events"], failed: [] });
  assert.deepEqual(found, [["meeting_minutes", "object", ["meeting"]]]);
});
